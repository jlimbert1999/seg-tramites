import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalProcedure } from '../schemas/external.schema';
import { CreateExternalProcedureDto } from '../dto/create-external.dto';
import { Account, Dependency } from 'src/administration/schemas';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';
import { UpdateExternalProcedureDto } from '../dto/update-external.dto';
import { Observation, groupProcedure } from '../schemas/observations.schema';

@Injectable()
export class ExternalService {
    constructor(
        @InjectModel(ExternalProcedure.name) private externalProcedureModel: Model<ExternalProcedure>,
        @InjectModel(TypeProcedure.name) private typeProcedure: Model<TypeProcedure>,
        @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
        @InjectModel(Observation.name) private observationModel: Model<Observation>,
    ) {
    }

    async search(limit: number, offset: number, id_account: string, text: string) {
        const regex = new RegExp(text, 'i')
        const data = await this.externalProcedureModel.aggregate([
            {
                $match: {
                    cuenta: new mongoose.Types.ObjectId(id_account),
                    estado: { $ne: 'ANULADO' },
                },
            },
            {
                $addFields: {
                    "solicitante.fullname": {
                        $concat: [
                            "$solicitante.nombre",
                            " ",
                            { $ifNull: ["$solicitante.paterno", ""] },
                            " ",
                            { $ifNull: ["$solicitante.materno", ""] },
                        ],
                    },
                },
            },
            {
                $match: {
                    $or: [
                        { "solicitante.fullname": regex },
                        { alterno: regex },
                        { detalle: regex }
                    ],
                },
            },
            {
                $lookup: {
                    from: 'tipos_tramites',
                    localField: "tipo_tramite",
                    foreignField: "_id",
                    as: "tipo_tramite"
                }
            },
            {
                $unwind: {
                    path: '$tipo_tramite'
                }
            },
            {
                $project: {
                    "solicitante.fullname": 0,
                    'requerimientos': 0,
                    "tipo_tramite.requerimientos": 0,
                    "tipo_tramite.segmento": 0,
                    "tipo_tramite.tipo": 0,
                    "tipo_tramite.activo": 0,
                }
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
        const procedures = data[0].paginatedResults
        const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0
        return { procedures, length }

    }
    async findAll(limit: number, offset: number, id_account: string) {
        const [procedures, total] = await Promise.all([
            await this.externalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
                .select('-requerimientos')
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite', 'nombre'),
            await this.externalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
        ])
        return { procedures, total }
    }

    async create(procedure: CreateExternalProcedureDto, acccount: Account) {
        const alterno = await this.generateAlterno(acccount, procedure.tipo_tramite)
        const createdProcedure = new this.externalProcedureModel({ alterno, cuenta: acccount._id, ...procedure })
        await createdProcedure.save()
        await createdProcedure.populate('tipo_tramite', 'nombre')
        return createdProcedure
    }

    async update(id_procedure: string, procedure: UpdateExternalProcedureDto) {
        return this.externalProcedureModel.findByIdAndUpdate(id_procedure, procedure, { new: true }).populate('tipo_tramite')
    }

    async getAllDataProcedure(id_procedure: string) {
        const procedure = await this.externalProcedureModel.findById(id_procedure)
            .populate('tipo_tramite', 'nombre')
            .populate({
                path: 'cuenta',
                select: '_id',
                populate: {
                    path: 'funcionario',
                    select: 'nombre paterno materno cargo',
                }
            })
        if (!procedure) throw new BadRequestException('El tramite no existe')
        const observations = await this.observationModel.find({ group: groupProcedure.tramites_externos, procedure: id_procedure })
        return { procedure, observations }
    }

    async generateAlterno(account: Account, id_typeProcedure: string) {
        const dependency = await this.dependencyModel.findById(account.dependencia._id).populate('institucion', 'sigla')
        if (!dependency) throw new BadRequestException('No se ha podido generar un alterno correctamente')
        if (!dependency.institucion) throw new BadRequestException('No se ha podido generar un alterno correctamente')
        const typeProcedure = await this.typeProcedure.findById(id_typeProcedure).select('segmento')
        if (!typeProcedure) throw new BadRequestException('No se ha podido generar un alterno correctamente')
        // TODO CONFIG YEAR IN ENV
        const regex = new RegExp(`${typeProcedure.segmento}-${dependency.institucion.sigla}-2023`.toUpperCase(), 'i')
        const correlativo = await this.externalProcedureModel.count({ alterno: regex })
        return `${typeProcedure.segmento}-${dependency.institucion.sigla}-2023-${String(correlativo + 1).padStart(6, '0')}`
    }

}
