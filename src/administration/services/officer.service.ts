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
        @InjectModel(JobChanges.name) private jobChangesModel: Model<JobChanges>,
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
                    preserveNullAndEmptyArrays: true
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
                        { 'dni': regex },
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
        // const officers = await this.officerModel.find({})
        // for (const officer of officers) {
        //     const newjob = await this.jobModel.create({ nombre: officer.oldcargo })
        //     await this.officerModel.findByIdAndUpdate(officer._id, { cargo: newjob._id })
        // }
        // console.log('end');
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
        if (!officer.cargo || officer.cargo === '') delete officer.cargo
        const createdOfficer = new this.officerModel(officer)
        const officerDB = await createdOfficer.save()
        if (officerDB.cargo) {
            const createdEvent = new this.jobChangesModel({ officer: officerDB._id, job: officerDB.cargo })
            await createdEvent.save()
        }
        return officerDB
    }

    async edit(id_officer: string, officer: UpdateOfficerDto) {
        const { dni } = officer
        const officerDB = await this.officerModel.findById(id_officer)
        if (!officerDB) throw new BadRequestException('El funcionario no existe')
        if (officerDB.dni !== dni) {
            const duplicate = await this.officerModel.findOne({ dni })
            if (duplicate) throw new BadRequestException('El dni introducido ya existe');
        }
        if (!officerDB.cargo && officer.cargo) {
            const createdEvent = new this.jobChangesModel({ officer: officerDB._id, job: officer.cargo })
            await createdEvent.save()
        }
        else if (officerDB.cargo && !officer.cargo) {
            await this.officerModel.findByIdAndUpdate(officerDB._id, { $unset: { cargo: 1 } })
        }
        else if (officerDB.cargo._id != officer.cargo) {
            const createdEvent = new this.jobChangesModel({ officer: officerDB._id, job: officer.cargo })
            await createdEvent.save()
        }
        return await this.officerModel.findByIdAndUpdate(id_officer, officer, { new: true }).populate('cargo')
    }
    async delete(id_officer: string) {
        const officerDB = await this.officerModel.findById(id_officer);
        if (!officerDB) throw new BadRequestException('El funcionario no existe')
        return await this.officerModel.findByIdAndUpdate(id_officer, { activo: !officerDB.activo }, { new: true })
    }

    async getOfficerWorkHistory(id_officer: string, limit: number, offset: number) {
        return await this.jobChangesModel.find({ officer: id_officer })
            .skip(offset)
            .limit(limit)
            .sort({ date: -1 })
            .populate('job', 'nombre')
            .populate('officer', 'nombre paterno materno')
    }
    async findOfficersWithoutAccount(text: string) {
        const regex = new RegExp(text, 'i')
        const officers = await this.officerModel.aggregate([
            {
                $addFields: {
                    fullname: {
                        $concat: ["$nombre", " ", "$paterno", " ", { $ifNull: ["$materno", ""] }]
                    }
                },
            },
            {
                $match: {
                    cuenta: false,
                    activo: true,
                    $or: [
                        { fullname: regex },
                        { dni: regex }
                    ]
                }
            },
            { $limit: 5 }
        ]);
        return await this.officerModel.populate(officers, { path: 'cargo' })
    }

    async findOfficerForProcess(text: string) {
        const regex = new RegExp(text, 'i')
        return await this.officerModel.aggregate([
            {
                $match: {
                    activo: true,
                }
            },
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
                    preserveNullAndEmptyArrays: true
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
            { $limit: 5 }
        ]);
    }


    async markOfficerWithAccount(id_officer: string, hasAccount: boolean) {
        return await this.officerModel.findByIdAndUpdate(id_officer, { cuenta: hasAccount })
    }
}


