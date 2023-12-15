import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalProcedure, InternalProcedure, Outbox, Procedure } from '../schemas';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { InternalDetail } from '../schemas/internal-detail.schema';
import { Dependency } from 'src/administration/schemas';
import { groupProcedure } from '../interfaces/group.interface';
import { CreateProcedureDto, UpdateProcedureDto } from '../dto';
import { Inbox } from '../schemas/inbox.schema';
import { Account } from 'src/auth/schemas/account.schema';
import { stateProcedure } from '../interfaces';
import { ConfigService } from '@nestjs/config';

interface ProcedureProps {
  id_detail: string;
  group: groupProcedure;
  dto: CreateProcedureDto;
  account: Account;
}

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
    // const procedures = await this.internalProcedureModel.find({});
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
    //   await this.imboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
    //   await this.outboxModel.updateMany({ tramite: procedure._id }, { $set: { tramite: createProcedure._id } });
    // }
    // return { ok: true };
  }
  async create(
    { account, group, id_detail, dto }: ProcedureProps,
    session: mongoose.mongo.ClientSession,
  ): Promise<Procedure> {
    const { segment, ...procedureProperties } = dto;
    const code = await this.generateCode(account, segment, group);
    const createdProcedure = new this.procedureModel({
      code,
      group,
      account: account._id,
      details: id_detail,
      ...procedureProperties,
    });
    await createdProcedure.save({ session });
    await createdProcedure.populate('details');
    return createdProcedure;
  }

  private async generateCode(account: Account, segment: string, group: groupProcedure): Promise<string> {
    const { dependencia } = await account.populate({
      path: 'dependencia',
      select: 'institucion',
      populate: {
        path: 'institucion',
        select: 'sigla',
      },
    });
    if (!dependencia) throw new InternalServerErrorException('Error al generar el codigo alterno');
    const code = `${segment}-${dependencia.institucion.sigla}-${this.configService.get('YEAR')}`.toUpperCase();
    const correlative = await this.procedureModel.count({ group: group, code: new RegExp(code) });
    return `${code}-${String(correlative + 1).padStart(group === groupProcedure.EXTERNAL ? 6 : 5, '0')}`;
  }

  async update(id_procedure: string, procedure: UpdateProcedureDto, session: mongoose.mongo.ClientSession) {
    return await this.procedureModel
      .findByIdAndUpdate(id_procedure, procedure, {
        session,
        new: true,
      })
      .populate('details');
  }

  async getProcedure(id_procedure: string) {
    const procedureDB = await this.procedureModel
      .findById(id_procedure)
      .populate('details')
      .populate('type', 'nombre')
      .populate({
        path: 'account',
        select: '_id',
        populate: {
          path: 'funcionario',
          select: 'nombre paterno materno cargo',
          populate: {
            path: 'cargo',
            select: 'nombre',
          },
        },
      });
    if (!procedureDB) throw new BadRequestException('El tramite no existe');
    return procedureDB;
  }

  async checkIfEditable(id_procedure: string, id_account: string) {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new BadRequestException('El tramite solicitado no existe');
    if (procedureDB.account._id.toString() !== id_account.toString())
      throw new BadRequestException('Usted no puede editar este tramite');
    if (procedureDB.state !== stateProcedure.INSCRITO)
      throw new BadRequestException('El tramite ya esta en proceso de evaluacion');
    return procedureDB;
  }
}
