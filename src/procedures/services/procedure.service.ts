import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  ExternalProcedure,
  Imbox,
  InternalProcedure,
  Outbox,
} from '../schemas';
import { Procedure } from '../schemas/procedure.schema';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { InternalDetail } from '../schemas/internal-detail.schema';
import { Account, Dependency, TypeProcedure } from 'src/administration/schemas';
import { groupProcedure } from '../interfaces/group.interface';
import { ProcedureDto } from '../dto/procedure.dto';

@Injectable()
export class ProcedureService {
  constructor(
    @InjectModel(ExternalProcedure.name)
    private externalProcedureModel: Model<ExternalProcedure>,
    @InjectModel(InternalProcedure.name)
    private InternalProcedureModel: Model<InternalProcedure>,
    @InjectModel(ExternalDetail.name)
    private externalDetailModel: Model<ExternalDetail>,
    @InjectModel(InternalDetail.name)
    private internalDetailModel: Model<InternalDetail>,
    @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
    @InjectModel(TypeProcedure.name)
    private typeProcedure: Model<TypeProcedure>,

    @InjectModel(Procedure.name)
    private procedureModel: Model<Procedure>,
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
    //   if (procedure.fecha_finalizacion)
    //     newProcedure['endDate'] = procedure.fecha_finalizacion;
    //   const externalDetail = {
    //     solicitante: procedure.solicitante,
    //     requirements: procedure.requerimientos,
    //     pin: procedure.pin,
    //   };
    //   if (procedure.representante)
    //     externalDetail['representante'] = procedure.representante;
    //   const createdDetails = new this.externalDetailModel(externalDetail);
    //   await createdDetails.save();
    //   newProcedure.group = 'ExternalDetail';
    //   newProcedure.details = createdDetails._id;
    //   const createProcedure = new this.procedureModel(newProcedure);
    //   await createProcedure.save();
    //   await this.imboxModel.updateMany(
    //     { tramite: procedure._id },
    //     { tramite: createProcedure._id },
    //   );
    //   await this.outboxModel.updateMany(
    //     { tramite: procedure._id },
    //     { tramite: createProcedure._id },
    //   );
    // }
    // const procedures = await this.InternalProcedureModel.find({});
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
    //   if (procedure.fecha_finalizacion)
    //     newProcedure['endDate'] = procedure.fecha_finalizacion;
    //   const internalDetail = {
    //     remitente: procedure.remitente,
    //     destinatario: procedure.destinatario,
    //   };
    //   const createdDetails = new this.internalDetailModel(internalDetail);
    //   await createdDetails.save();
    //   newProcedure.group = 'InternalDetail';
    //   newProcedure.details = createdDetails._id;
    //   const createProcedure = new this.procedureModel(newProcedure);
    //   await createProcedure.save();
    //   await this.imboxModel.updateMany(
    //     { tramite: procedure._id },
    //     { tramite: createProcedure._id },
    //   );
    //   await this.outboxModel.updateMany(
    //     { tramite: procedure._id },
    //     { tramite: createProcedure._id },
    //   );
    // }
    // return { ok: true };
  }
  async create(
    procedure: ProcedureDto,
    account: Account,
    id_detail: string,
    group: groupProcedure,
    session: mongoose.mongo.ClientSession,
  ) {
    const code = await this.generateCode(
      account.dependencia._id,
      procedure.type,
      group,
    );
    const createdProcedure = new this.procedureModel({
      code,
      group,
      account: account._id,
      details: id_detail,
      ...procedure,
    });
    await createdProcedure.save({ session });
    await createdProcedure.populate('details');
    return createdProcedure;
  }

  async generateCode(
    id_dependency: string,
    id_typeProcedure: string,
    group: groupProcedure,
  ) {
    const [dependency, typeProcedure] = await Promise.all([
      this.dependencyModel
        .findById(id_dependency)
        .populate('institucion', 'sigla'),
      this.typeProcedure.findById(id_typeProcedure).select('segmento'),
    ]);
    if (!dependency || !typeProcedure)
      throw new BadRequestException(
        'No se ha podido generar un alterno correctamente',
      );
    if (!dependency.institucion)
      throw new BadRequestException(
        'No se ha podido generar un alterno correctamente',
      );
    // TODO CONFIG YEAR IN ENV
    const regex = new RegExp(
      `${typeProcedure.segmento}-${dependency.institucion.sigla}-2023`.toUpperCase(),
      'i',
    );
    const correlativo = await this.procedureModel.count({
      group: group,
      code: regex,
    });
    const zeros = group === groupProcedure.EXTERNAL ? 6 : 5;
    return `${typeProcedure.segmento}-${
      dependency.institucion.sigla
    }-2023-${String(correlativo + 1).padStart(zeros, '0')}`;
  }
}
