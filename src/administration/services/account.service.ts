import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../schemas/account.schema';
import mongoose, { Model } from 'mongoose';
@Injectable()
export class AccountService {
    constructor(
        @InjectModel(Account.name) private accountModel: Model<Account>
    ) {
    }

    async search(limit: number, offset: number, text: string, institution: string | undefined, dependency: string | undefined) {
        const query = {}
        if (institution) {
            query['dependencia.institucion._id'] = new mongoose.Types.ObjectId(institution)
            if (dependency) {
                query['dependencia._id'] = new mongoose.Types.ObjectId(dependency)
            }
        }
        if (text) {
            query['$or'] = [
                { "funcionario.fullname": new RegExp(text, 'i') },
                { "funcionario.cargo": new RegExp(text, 'i') },
                { "funcionario.dni": new RegExp(text, 'i') }
            ]
        }
        const data = await this.accountModel.aggregate([
            {
                $lookup: {
                    from: "dependencias",
                    localField: "dependencia",
                    foreignField: "_id",
                    as: "dependencia",
                },
            },
            {
                $unwind: {
                    path: "$dependencia",
                },
            },
            {
                $project: {
                    password: 0,
                }
            },
            {
                $lookup: {
                    from: "instituciones",
                    localField: "dependencia.institucion",
                    foreignField: "_id",
                    as: "dependencia.institucion",
                },
            },
            {
                $unwind: {
                    path: "$dependencia.institucion",
                },
            },
            {
                $lookup: {
                    from: "funcionarios",
                    localField: "funcionario",
                    foreignField: "_id",
                    as: "funcionario",
                },
            },
            {
                $unwind: {
                    path: "$funcionario",
                },
            },
            {
                $addFields: {
                    "funcionario.fullname": {
                        $concat: [
                            "$funcionario.nombre",
                            " ",
                            { $ifNull: ["$funcionario.paterno", ""] },
                            " ",
                            { $ifNull: ["$funcionario.materno", ""] },
                        ],
                    },
                },
            },
            {
                $match: query
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: offset }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }
        ]);
        const accounts = data[0].paginatedResults
        const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0
        return { accounts, length }
    }

    async findAll(limit: number, offset: number) {
        offset = offset * limit
        const [accounts, length] = await Promise.all(
            [
                this.accountModel.find({ _id: { $ne: process.env.ID_ROOT } }, { password: 0 })
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 })
                    .populate({
                        path: 'dependencia',
                        populate: {
                            path: 'institucion'
                        }
                    })
                    .populate('funcionario'),
                this.accountModel.count({ _id: { $ne: process.env.ID_ROOT } })
            ]
        )
        return { accounts, length }
    }
}
