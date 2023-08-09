import { BadRequestException, Injectable } from '@nestjs/common';
import { Observation, groupProcedure } from '../schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInternalProcedureDto } from '../dto/create-internal.dto';
import { Account, Dependency } from 'src/administration/schemas';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';
import { UpdateInternalProcedureDto } from '../dto/update-internal.dto';
import { InternalProcedure } from '../schemas/internal.schema';

@Injectable()
export class InternalService {
    constructor(
        @InjectModel(InternalProcedure.name) private internalProcedureModel: Model<InternalProcedure>,
        @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
        @InjectModel(TypeProcedure.name) private typeProcedure: Model<TypeProcedure>,
        @InjectModel(Observation.name) private observationModel: Model<Observation>,
    ) {
    }
    async add(procedure: CreateInternalProcedureDto, account: Account) {
        const newProcedure = {
            alterno: await this.generateAlterno(account.dependencia._id, procedure.tipo_tramite),
            cuenta: account._id,
            ...procedure
        }
        const createdProcedure = new this.internalProcedureModel(newProcedure)
        await createdProcedure.save()
        await this.internalProcedureModel.populate(createdProcedure, { path: 'tipo_tramite', select: 'nombre' })
        return createdProcedure
    }

    async update(id_procedure: string, procedure: UpdateInternalProcedureDto) {
        return this.internalProcedureModel.findByIdAndUpdate(id_procedure, procedure, { new: true }).populate('tipo_tramite', 'nombre')
    }

    async findAll(limit: number, offset: number, id_account: string) {
        offset = offset * limit
        const [procedures, length] = await Promise.all([
            await this.internalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite', 'nombre'),
            await this.internalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
        ])
        return { procedures, length }
    }
    async search(limit: number, offset: number, id_account: string, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [procedures, length] = await Promise.all([
            this.internalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' }, $or: [{ alterno: regex }, { detalle: regex }, { cite: regex }, { 'destinatario.nombre': regex }] })
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite', 'nombre'),
            await this.internalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' }, $or: [{ alterno: regex }, { detalle: regex }, { cite: regex }, { 'destinatario.nombre': regex }] })
        ])
        return { procedures, length }
    }

    async getAllDataProcedure(id_procedure: string) {
        const procedure = await this.internalProcedureModel.findById(id_procedure)
            .populate('tipo_tramite', 'nombre')
            .populate({
                path: 'cuenta',
                select: '_id',
                populate: {
                    path: 'funcionario',
                    select: 'nombre paterno materno cargo',
                    populate: {
                        path: 'cargo',
                        select: 'nombre'
                    }
                }
            })
        if (!procedure) throw new BadRequestException('El tramite no existe')
        const observations = await this.observationModel.find({ group: groupProcedure.tramites_internos, procedure: id_procedure })
        return { procedure, observations }
    }

    async generateAlterno(id_dependency: string, id_typeProcedure: string) {
        const [dependency, typeProcedure] = await Promise.all([
            this.dependencyModel.findById(id_dependency).populate('institucion', 'sigla'),
            this.typeProcedure.findById(id_typeProcedure).select('segmento')
        ])
        if (!dependency || !typeProcedure) throw new BadRequestException('No se ha podido generar un alterno correctamente')
        if (!dependency.institucion) throw new BadRequestException('No se ha podido generar un alterno correctamente')
        // TODO CONFIG YEAR IN ENV
        const regex = new RegExp(`${typeProcedure.segmento}-${dependency.institucion.sigla}-2023`.toUpperCase(), 'i')
        const correlativo = await this.internalProcedureModel.count({ alterno: regex })
        return `${typeProcedure.segmento}-${dependency.institucion.sigla}-2023-${String(correlativo + 1).padStart(5, '0')}`
    }
}
