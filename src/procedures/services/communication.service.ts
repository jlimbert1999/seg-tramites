import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Outbox, Inbox, Procedure, Communication } from '../schemas';
import { stateProcedure, statusMail } from '../interfaces';
import { createFullName } from 'src/administration/helpers/fullname';
import { CreateCommunicationDto, GetInboxParamsDto, ReceiverDto } from '../dto';
import { Account } from 'src/auth/schemas/account.schema';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Officer } from 'src/administration/schemas';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Inbox.name) private inboxModel: Model<Inbox>,
    @InjectModel(Officer.name) private officerModel: Model<Officer>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Communication.name) private communicationModel: Model<Communication>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async generateCollection() {
    // ! method execute after modify emitter an recerivers old collection
    // FIRT STEP
    // const outbox = await this.outboxModel.find({});
    // for (const item of outbox) {
    //   const status = item.recibido === true ? 'completed' : item.recibido === false ? 'rejected' : 'pending';
    //   const newCommunication = new this.communicationModel({
    //     emitter: item.emisor,
    //     receiver: item.receptor,
    //     procedure: item.tramite,
    //     reference: item.motivo,
    //     attachmentQuantity: item.cantidad,
    //     internalNumber: item.numero_interno,
    //     outboundDate: item.fecha_envio,
    //     inboundDate: item.fecha_recibido,
    //     rejectionReason: item.motivo_rechazo,
    //     status,
    //     id_old: item._id,
    //   });
    //   await newCommunication.save();
    // }
    // console.log('completed');
    // SECOND STEP
    // const inbox = await this.inboxModel.find({});
    // for (const item of inbox) {
    //   const status = item.recibido === undefined ? 'pending' : 'received';
    //   const editCom = await this.communicationModel.findOneAndUpdate(
    //     {
    //       procedure: item.tramite,
    //       'emitter.cuenta': item.emisor.cuenta,
    //       'receiver.cuenta': item.receptor.cuenta,
    //       outboundDate: item.fecha_envio,
    //       status: { $ne: 'rejected' },
    //     },
    //     { status },
    //   );
    //   if (!editCom) console.log('no found document', item);
    // }
    // console.log('collection done!!!');
  }
  async repairOldSchemas() {
    // FOR EMITTER
    // const mails = await this.outboxModel.find({});
    // for (const mail of mails) {
    //   const participant = {};
    //   if (!mail.emisor.funcionario) {
    //     await this.outboxModel.populate(mail, { path: 'emisor.cuenta' });
    //     if (!mail.emisor.cuenta.funcionario) {
    //       participant['fullname'] = 'NO DESIGNADO';
    //     } else {
    //       const officer = await this.officerModel
    //         .findById(mail.emisor.cuenta.funcionario._id)
    //         .populate('cargo', 'nombre');
    //       participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
    //       if (officer.cargo) {
    //         participant['jobtitle'] = officer.cargo.nombre;
    //       }
    //     }
    //   } else {
    //     const officer = await this.officerModel.findById(mail.emisor.funcionario._id).populate('cargo', 'nombre');
    //     participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
    //     if (officer.cargo) {
    //       participant['jobtitle'] = officer.cargo.nombre;
    //     }
    //   }
    //   await this.outboxModel.findByIdAndUpdate(mail._id, {
    //     emisor: { cuenta: mail.emisor.cuenta._id, ...participant },
    //   });
    //   console.log('ok');
    // }
    // console.log('end');
    // FOR RECEIVER
    // const mails = await this.outboxModel.find({});
    // for (const mail of mails) {
    //   const participant = {};
    //   if (!mail.receptor.funcionario) {
    //     await this.outboxModel.populate(mail, { path: 'receptor.cuenta' });
    //     if (!mail.receptor.cuenta.funcionario) {
    //       participant['fullname'] = 'NO DESIGNADO';
    //     } else {
    //       const officer = await this.officerModel
    //         .findById(mail.receptor.cuenta.funcionario._id)
    //         .populate('cargo', 'nombre');
    //       participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
    //       if (officer.cargo) {
    //         participant['jobtitle'] = officer.cargo.nombre;
    //       }
    //     }
    //   } else {
    //     const officer = await this.officerModel.findById(mail.receptor.funcionario._id).populate('cargo', 'nombre');
    //     participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
    //     if (officer.cargo) {
    //       participant['jobtitle'] = officer.cargo.nombre;
    //     }
    //   }
    //   await this.outboxModel.findByIdAndUpdate(mail._id, {
    //     receptor: { cuenta: mail.receptor.cuenta._id, ...participant },
    //   });
    //   console.log('ok');
    // }
    // console.log('end');
  }
  async getInboxOfAccount(id_account: string, { limit, offset, status }: GetInboxParamsDto) {
    const query: mongoose.FilterQuery<Communication> = {
      'receiver.cuenta': id_account,
    };
    status ? (query.status = status) : (query.$or = [{ status: statusMail.Received }, { status: statusMail.Pending }]);
    const [mails, length] = await Promise.all([
      this.communicationModel.find(query).skip(offset).limit(limit).sort({ outboundDate: -1 }).populate('procedure'),
      this.communicationModel.count(query),
    ]);
    return { mails, length };
  }
  async getOutboxOfAccount(id_account: string, { limit, offset }: PaginationParamsDto) {
    const dataPaginated = await this.communicationModel.aggregate([
      {
        $match: {
          'emitter.cuenta': id_account,
        },
      },
      {
        $group: {
          _id: {
            account: '$emitter.cuenta',
            procedure: '$procedure',
            outboundDate: '$outboundDate',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'procedures',
          localField: '_id.procedure',
          foreignField: '_id',
          as: '_id.procedure',
        },
      },
      {
        $unwind: {
          path: '$_id.procedure',
        },
      },
      { $sort: { '_id.outboundDate': -1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: offset }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0;
    return { mails, length };
  }
  async searchInbox(id_account: string, text: string, { limit, offset, status }: GetInboxParamsDto) {
    const regex = new RegExp(text, 'i');
    const query: mongoose.FilterQuery<Communication> = {
      'receiver.cuenta': id_account,
    };
    status ? (query.status = status) : (query.$or = [{ status: statusMail.Received }, { status: statusMail.Pending }]);
    const data = await this.communicationModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'procedures',
          localField: 'procedure',
          foreignField: '_id',
          as: 'procedure',
        },
      },
      {
        $unwind: '$procedure',
      },
      {
        $match: {
          $or: [{ 'procedure.code': regex }, { 'procedure.reference': regex }],
        },
      },
      {
        $facet: {
          paginatedResults: [{ $skip: offset }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const mails = data[0].paginatedResults;
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { mails, length };
  }
  async searchOutbox(id_account: string, text: string, { limit, offset }: PaginationParamsDto) {
    offset = offset * limit;
    const regex = new RegExp(text);
    const dataPaginated = await this.communicationModel.aggregate([
      {
        $match: {
          'emitter.cuenta': id_account,
        },
      },
      {
        $group: {
          _id: {
            account: '$emitter.cuenta',
            procedure: '$procedure',
            outboundDate: '$outboundDate',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'procedures',
          localField: '_id.procedure',
          foreignField: '_id',
          as: '_id.procedure',
        },
      },
      {
        $unwind: {
          path: '$_id.procedure',
        },
      },
      {
        $match: {
          $or: [{ '_id.procedure.code': regex }, { '_id.procedure.reference': regex }],
        },
      },
      {
        $facet: {
          paginatedResults: [{ $skip: offset }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0;
    return { mails, length };
  }
  async create(communication: CreateCommunicationDto, account: Account) {
    const { id_mail, id_procedure, receivers } = communication;
    await this.verifyDuplicateSend(id_procedure, receivers);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (id_mail) {
        await this.communicationModel.updateOne({ _id: id_mail }, { status: statusMail.Completed }, { session });
      } else {
        await this.procedureModel.updateOne({ _id: id_procedure }, { send: true }, { session });
      }
      const mails = await this.createMailData(account, communication);
      const createdMails = await this.communicationModel.insertMany(mails, {
        session,
      });
      await this.communicationModel.populate(createdMails, 'procedure');
      await session.commitTransaction();
      return mails;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al enviar el tramite');
    } finally {
      session.endSession();
    }
  }
  async acceptMail(id_mail: string) {
    const mailDB = await this.communicationModel.findById(id_mail).populate('procedure', 'state');
    if (!mailDB) throw new BadRequestException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== statusMail.Pending) throw new BadRequestException('El tramite ya ha sido aceptado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { procedure } = mailDB;
      await this.communicationModel.updateOne(
        { _id: id_mail },
        { status: statusMail.Received, inboundDate: new Date() },
      );
      if (procedure.state !== stateProcedure.OBSERVADO) {
        await this.procedureModel.updateOne(
          { _id: procedure._id },
          {
            state: stateProcedure.EN_REVISION,
          },
          { session },
        );
        procedure.state = stateProcedure.EN_REVISION;
      }
      await session.commitTransaction();
      return { state: procedure.state, message: 'Tramite aceptado correctamente.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Ha ocurrido un error al aceptar el tramite');
    } finally {
      await session.endSession();
    }
  }
  async rejectMail(id_mail: string, rejectionReason: string) {
    const mailDB = await this.communicationModel.findById(id_mail);
    if (!mailDB) throw new BadRequestException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== statusMail.Pending) throw new BadRequestException('El tramite ya fue rechazado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { procedure, emitter } = mailDB;
      await this.communicationModel.updateOne(
        { _id: id_mail },
        {
          status: statusMail.Rejected,
          inboundDate: new Date(),
          rejectionReason,
        },
        { session },
      );
      await this.recoverLastMailSend(procedure._id, emitter.cuenta._id, session);
      await session.commitTransaction();
      return { message: 'Tramite rechazado correctamente.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se pudo rechazar el tramite');
    } finally {
      await session.endSession();
    }
  }
  async createMailData(emitterAccount: Account, communication: CreateCommunicationDto): Promise<Communication[]> {
    const { receivers, id_procedure, ...values } = communication;
    const { _id, funcionario } = await emitterAccount.populate({
      path: 'funcionario',
      select: 'nombre paterno materno cargo',
      populate: {
        path: 'cargo',
        select: 'nombre',
      },
    });
    const emitter = {
      cuenta: _id,
      fullname: createFullName(funcionario),
      ...(funcionario.cargo && { jobtitle: funcionario.cargo.nombre }),
    };
    const outboundDate = new Date();
    const mails = receivers.map((receiver) => {
      return new this.communicationModel({
        procedure: id_procedure,
        outboundDate,
        emitter,
        receiver,
        ...values,
      });
    });
    return mails;
  }
  async verifyDuplicateSend(id_procedure: string, receivers: ReceiverDto[]) {
    // ! change query for receive procedures distinc emitter
    for (const receiver of receivers) {
      const mail = await this.communicationModel.findOne({
        'receiver.cuenta': receiver.cuenta,
        procedure: id_procedure,
        $or: [{ status: statusMail.Pending }, { status: statusMail.Received }],
      });
      if (mail) {
        throw new BadRequestException(
          `El funcionario ${receiver.fullname} ya tiene el tramite en su bandeja de entrada`,
        );
      }
    }
  }
  async cancelMails(ids_mails: string[], id_procedure: string, id_currentEmitter: string) {
    const canceledMails = await this.checkIfMailsHaveBeenReceived(ids_mails);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.communicationModel.deleteMany({ _id: { $in: ids_mails } }, { session });
      const recoveredMail = await this.recoverLastMailSend(id_procedure, id_currentEmitter, session);
      await session.commitTransaction();
      return {
        message: `El tramite ahora se encuentra en su ${
          recoveredMail ? 'bandeja de entrada' : 'administracion de tramites'
        } para su reenvio.`,
        canceledMails,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Ha ocurrido un error al cancelar un envio');
    } finally {
      await session.endSession();
    }
  }
  async recoverLastMailSend(id_procedure: string, id_currentEmitter: string, session: mongoose.mongo.ClientSession) {
    const lastMailSend = await this.communicationModel
      .findOneAndUpdate(
        {
          procedure: id_procedure,
          'receiver.cuenta': id_currentEmitter,
          status: statusMail.Completed,
        },
        { status: statusMail.Received },
        { session, sort: { _id: -1 }, new: true },
      )
      .populate('procedure');
    if (!lastMailSend) {
      await this.procedureModel.updateOne({ _id: id_procedure }, { send: false }, { session });
    }
    return lastMailSend;
  }
  async checkIfMailsHaveBeenReceived(ids_mails: string[]) {
    const canceledMails: Communication[] = [];
    for (const id_mail of ids_mails) {
      const mail = await this.communicationModel.findById(id_mail);
      if (mail.status !== statusMail.Pending) {
        throw new BadRequestException(
          `El tramite ya ha sido ${
            mail.status === statusMail.Rejected ? 'rechazado' : ' recibido'
          } por el funcionario ${mail.receiver.fullname}`,
        );
      }
      canceledMails.push(mail);
    }
    return canceledMails;
  }
  async getWorkflowOfProcedure(id_procedure: string) {
    const workflow = await this.communicationModel.aggregate([
      {
        $match: {
          procedure: new mongoose.Types.ObjectId(id_procedure),
        },
      },
      {
        $group: {
          _id: {
            emitterAccount: '$emitter.cuenta',
            outboundDate: '$outboundDate',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          '_id.outboundDate': 1,
        },
      },
    ]);
    for (const item of workflow) {
      await this.communicationModel.populate(item['sendings'], [
        {
          path: 'emitter.cuenta',
          select: '_id',
          populate: {
            path: 'dependencia',
            select: 'nombre',
            populate: {
              path: 'institucion',
              select: 'nombre sigla',
            },
          },
        },
        {
          path: 'receiver.cuenta',
          select: '_id',
          populate: {
            path: 'dependencia',
            select: 'nombre',
            populate: {
              path: 'institucion',
              select: 'nombre sigla',
            },
          },
        },
      ]);
    }
    return workflow;
  }
  async getMailDetails(id_mail: string) {
    const mailDB = await this.communicationModel.findById(id_mail).populate('procedure');
    if (!mailDB) throw new BadRequestException('El envio de este tramite ha sido cancelado');
    return mailDB;
  }
}
