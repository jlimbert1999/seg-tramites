import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExternalProcedure, InternalProcedure, Outbox, Procedure } from '../schemas';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { InternalDetail } from '../schemas/internal-detail.schema';
import { Dependency } from 'src/administration/schemas';
import { Inbox } from '../schemas/inbox.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProcedureService {
  constructor(
    @InjectModel(ExternalProcedure.name)
    private externalProcedureModel: Model<ExternalProcedure>,
    @InjectModel(InternalProcedure.name)
    private internalProcedureModel: Model<InternalProcedure>,
    @InjectModel(ExternalDetail.name)
    private externalDetailModel: Model<ExternalDetail>,
    @InjectModel(InternalDetail.name)
    private internalDetailModel: Model<InternalDetail>,
    @InjectModel(Inbox.name) private imboxModel: Model<Inbox>,
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
    @InjectModel(Procedure.name)
    private procedureModel: Model<Procedure>,
    private readonly configService: ConfigService,
  ) {}
  async updateAll() {
    // const procedures = await this.externalProcedureModel.find({});
    // for (const procedure of procedures) {
    //   const newProcedure: any = {
    //     code: procedure.alterno,
    //     cite: procedure.cite,
    //     type: procedure.tipo_tramite._id,
    //     account: procedure.cuenta._id,
    //     state: procedure.estado,
    //     reference: procedure.detalle,
    //     amount: procedure.cantidad,
    //     send: procedure.enviado,
    //     startDate: procedure.fecha_registro,
    //     tramite: procedure._id,
    //   };
    //   if (procedure.fecha_finalizacion) newProcedure['endDate'] = procedure.fecha_finalizacion;
    //   const externalDetail = {
    //     solicitante: procedure.solicitante,
    //     requirements: procedure.requerimientos,
    //     pin: procedure.pin,
    //   };
    //   if (procedure.representante) externalDetail['representante'] = procedure.representante;
    //   const createdDetails = new this.externalDetailModel(externalDetail);
    //   await createdDetails.save();
    //   newProcedure.group = 'ExternalDetail';
    //   newProcedure.details = createdDetails._id;
    //   const createProcedure = new this.procedureModel(newProcedure);
    //   await createProcedure.save();
    //   await this.imboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
    //   await this.outboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
    // }
    // console.log('end');
    const procedures = await this.internalProcedureModel.find({});
    for (const procedure of procedures) {
      const newProcedure: any = {
        code: procedure.alterno,
        cite: procedure.cite,
        type: procedure.tipo_tramite._id,
        account: procedure.cuenta._id,
        state: procedure.estado,
        reference: procedure.detalle,
        amount: procedure.cantidad,
        send: procedure.enviado,
        startDate: procedure.fecha_registro,
        tramite: procedure._id,
      };
      if (procedure.fecha_finalizacion) newProcedure['endDate'] = procedure.fecha_finalizacion;
      const internalDetail = {
        remitente: procedure.remitente,
        destinatario: procedure.destinatario,
      };
      const createdDetails = new this.internalDetailModel(internalDetail);
      await createdDetails.save();
      newProcedure.group = 'InternalDetail';
      newProcedure.details = createdDetails._id;
      const createProcedure = new this.procedureModel(newProcedure);
      await createProcedure.save();
      await this.imboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
      await this.outboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
    }
    return { ok: true };
  }
}
