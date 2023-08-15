import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExternalProcedure, Imbox, InternalProcedure, Outbox } from '../schemas';
import { Procedure } from '../schemas/procedure.schema';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { InternalDetail } from '../schemas/internal-detail.schema';

@Injectable()
export class ProcedureService {
    constructor(
        @InjectModel(ExternalProcedure.name) private externalProcedureModel: Model<ExternalProcedure>,
        @InjectModel(InternalProcedure.name) private InternalProcedureModel: Model<InternalProcedure>,
        @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
        @InjectModel(ExternalDetail.name) private externalDetailModel: Model<ExternalDetail>,
        @InjectModel(InternalDetail.name) private internalDetailModel: Model<InternalDetail>,
        @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
        @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    ) {

    }
    async updateAll() {
        // const procedures = await this.externalProcedureModel.find({})
        // for (const procedure of procedures) {
        //     const newProcedure: any = {
        //         code: procedure.alterno,
        //         cite: procedure.cite,
        //         type: procedure.tipo_tramite._id,
        //         account: procedure.cuenta._id,
        //         state: procedure.estado,
        //         reference: procedure.detalle,
        //         amount: procedure.cantidad,
        //         send: procedure.enviado,
        //         startDate: procedure.fecha_registro
        //     }
        //     if (procedure.fecha_finalizacion) newProcedure['endDate'] = procedure.fecha_finalizacion
        //     const externalDetail = {
        //         solicitante: procedure.solicitante,
        //         requirements: procedure.requerimientos,
        //         pin: procedure.pin
        //     }
        //     if (procedure.representante) externalDetail['representante'] = procedure.representante
        //     const createdDetails = new this.externalDetailModel(externalDetail)
        //     await createdDetails.save()
        //     newProcedure.group = 'EXTERNAL'
        //     newProcedure.details = createdDetails._id

        //     const createProcedure = new this.procedureModel(newProcedure)
        //     await createProcedure.save()

        //     await this.imboxModel.updateMany({ tramite: procedure._id }, { tramite: createProcedure._id })
        //     await this.outboxModel.updateMany({ tramite: procedure._id }, { tramite: createProcedure._id })
        // }

        // const procedures = await this.InternalProcedureModel.find({})
        // for (const procedure of procedures) {
        //     const newProcedure: any = {
        //         code: procedure.alterno,
        //         cite: procedure.cite,
        //         type: procedure.tipo_tramite._id,
        //         account: procedure.cuenta._id,
        //         state: procedure.estado,
        //         reference: procedure.detalle,
        //         amount: procedure.cantidad,
        //         send: procedure.enviado,
        //         startDate: procedure.fecha_registro
        //     }
        //     if (procedure.fecha_finalizacion) newProcedure['endDate'] = procedure.fecha_finalizacion
        //     const internalDetail = {
        //         remitente: procedure.remitente,
        //         destinatario: procedure.destinatario
        //     }
        //     const createdDetails = new this.internalDetailModel(internalDetail)
        //     await createdDetails.save()
        //     newProcedure.group = 'INTERNAL'
        //     newProcedure.details = createdDetails._id
        //     const createProcedure = new this.procedureModel(newProcedure)
        //     await createProcedure.save()
        //     await this.imboxModel.updateMany({ tramite: procedure._id }, { tramite: createProcedure._id })
        //     await this.outboxModel.updateMany({ tramite: procedure._id }, { tramite: createProcedure._id })
        // }
        return { ok: true }
    }
}
