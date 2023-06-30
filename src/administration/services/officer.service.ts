import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Officer } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';
import { Job, JobSchema } from '../schemas/job.schema';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import * as fs from 'fs';
import { JobChanges } from '../schemas/jobChanges.schema';


@Injectable()
export class OfficerService {
    constructor(
        @InjectModel(Officer.name) private officerModel: Model<Officer>,
        @InjectModel(Job.name) private jobModel: Model<Job>,
        @InjectModel(JobChanges.name) private jobChangesSchema: Model<JobChanges>,
    ) {
    }

    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const dataPaginated = await this.officerModel.aggregate([
            {
                $lookup: {
                    from: 'cargos',
                    localField: "cargo",
                    foreignField: "_id",
                    as: "cargo"
                }
            },
            {
                $unwind: {
                    path: "$cargo",
                    preserveNullAndEmptyArrays: true // Incluye funcionarios sin cargo asignado
                }
            },
            {
                $addFields: {
                    "fullname": {
                        $concat: [
                            "$nombre",
                            " ",
                            { $ifNull: ["$paterno", ""] },
                            " ",
                            { $ifNull: ["$materno", ""] },
                        ],
                    },
                },
            },
            {
                $match: {
                    $or: [
                        { 'fullname': regex },
                        { 'cargo.nombre': regex }
                    ]
                }
            },

            { $sort: { _id: -1 } },
            {
                $facet: {
                    paginatedResults: [{ $skip: offset }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
        ])
        const officers = dataPaginated[0].paginatedResults
        const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0
        return { officers, length }
    }

    async get(limit: number, offset: number) {
        const [officers, length] = await Promise.all(
            [
                this.officerModel.find({})
                    .sort({ _id: -1 })
                    .skip(offset)
                    .limit(limit)
                    .populate('cargo', 'nombre'),
                this.officerModel.count()
            ]
        )
        return { officers, length }
    }

    async add(officer: CreateOfficerDto, image: Express.Multer.File | undefined) {
        const { dni } = officer
        const duplicate = await this.officerModel.findOne({ dni })
        if (duplicate) throw new BadRequestException('El dni introducido ya existe');
        // TODO implementar carga de imagen
        // if (image) {
        //     const imageUrl = this.saveImageFileSystem(image)
        //     officer.imageUrl = imageUrl
        // }
        if (!officer.cargo) delete officer.cargo
        const createdOfficer = new this.officerModel(officer)
        return await createdOfficer.save()
    }

    async edit(id_officer: string, officer: UpdateOfficerDto) {
        const { dni } = officer
        const officerDb = await this.officerModel.findById(id_officer)
        if (!officerDb) throw new BadRequestException('El funcionario no existe')
        if (officerDb.dni !== dni) {
            const duplicate = await this.officerModel.findOne({ dni })
            if (duplicate) throw new BadRequestException('El dni introducido ya existe');
        }
        if (officerDb.cargo._id != officer.cargo) {
            console.log('change officer job event');
            console.log(officerDb.cargo, officer.cargo);
        }
        return await this.officerModel.findByIdAndUpdate(id_officer, officer, { new: true })

    }

}
