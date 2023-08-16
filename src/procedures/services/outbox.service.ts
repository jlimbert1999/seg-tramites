import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalProcedure, InternalProcedure, Outbox } from '../schemas';
import { Account, Officer } from 'src/administration/schemas';

@Injectable()
export class OutboxService {
    constructor(
        @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
        @InjectModel(Officer.name) private officer: Model<Officer>,
        @InjectModel(Account.name) private accountModel: Model<Account>,
        @InjectModel(ExternalProcedure.name) private externalProcedure: Model<ExternalProcedure>,
        @InjectModel(InternalProcedure.name) private internalProcedure: Model<InternalProcedure>,

    ) { }

    async getAll(id_account: string, limit: number, offset: number) {
        const dataPaginated = await this.outboxModel.aggregate([
            {
                $match: {
                    "emisor.cuenta": id_account
                }
            },
            {
                $group: {
                    _id: {
                        'cuenta': '$emisor.cuenta',
                        'tramite': '$tramite',
                        'tipo': '$tipo',
                        'fecha_envio': '$fecha_envio'
                    },
                    sendings: { $push: "$$ROOT" }
                }
            },
            { $sort: { '_id.fecha_envio': -1 } },
            {
                $facet: {
                    paginatedResults: [{ $skip: (offset * limit) }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
        ])
       
        for (const mail of dataPaginated[0].paginatedResults) {
            await this.outboxModel.populate(mail.sendings, { path: 'tramite', select: 'alterno detalle estado' })
            console.log(mail.sendings);
        }
        console.log(dataPaginated[0].paginatedResults.sendings);
        const mails = dataPaginated[0].paginatedResults
        const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0
        return { mails, length }
    }

    async getWorkflow(id_procedure: string) {
        const workflow = await this.outboxModel.aggregate([
            {
                $match: {
                    "tramite": new mongoose.Types.ObjectId(id_procedure)
                }
            },
            {
                $group: {
                    _id: {
                        'cuenta': '$emisor.cuenta',
                        'tipo': '$tipo',
                        'fecha_envio': '$fecha_envio'
                    },
                    sendings: { $push: "$$ROOT" }
                }
            },
            {
                $sort: {
                    '_id.fecha_envio': 1
                }
            }
        ]);
        for (const item of workflow) {
            await this.accountModel.populate(item['sendings'], [
                {
                    path: 'emisor.cuenta',
                    select: '_id',
                    populate: {
                        path: 'dependencia',
                        select: 'nombre',
                        populate: {
                            path: 'institucion',
                            select: 'nombre sigla'
                        }
                    }
                },
                {
                    path: 'receptor.cuenta',
                    select: '_id',
                    populate: {
                        path: 'dependencia',
                        select: 'nombre',
                        populate: {
                            path: 'institucion',
                            select: 'nombre sigla'
                        }
                    }
                }
            ])
        }
        return workflow
    }
}
