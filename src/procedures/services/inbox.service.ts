import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Communication, Procedure } from '../schemas';
import { Account } from 'src/administration/schemas';
import { createFullName } from 'src/administration/helpers/fullname';
import { stateProcedure } from '../interfaces/states-procedure.interface';
import { CreateCommunicationDto, ReceiverDto } from '../dto';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { statusMail } from '../interfaces';

@Injectable()
export class InboxService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(Procedure.name)
    private readonly procedureModel: Model<Procedure>,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async generateCollection() {
    // ! method execute after modify emitter an recerivers old collection
    // FIRT STEP
    // const outbox = await this.outboxModel.find({});
    // for (const item of outbox) {
    //   const status =
    //     item.recibido === true
    //       ? 'completed'
    //       : item.recibido === false
    //       ? 'rejected'
    //       : 'pending';
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
    //   });
    //   await newCommunication.save();
    // }
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
    // const mails = await this.inboxModel.find({});
    // for (const mail of mails) {
    //   const participant = {};
    //   if (!mail.emisor.funcionario) {
    //     await this.inboxModel.populate(mail, { path: 'emisor.cuenta' });
    //     if (!mail.emisor.cuenta.funcionario) {
    //       participant['fullname'] = 'NO DESIGNADO';
    //     } else {
    //       const officer = await this.officerModel
    //         .findById(mail.emisor.cuenta.funcionario._id)
    //         .populate('cargo', 'nombre');
    //       participant['fullname'] = [
    //         officer.nombre,
    //         officer.paterno,
    //         officer.materno,
    //       ]
    //         .filter(Boolean)
    //         .join(' ');
    //       if (officer.cargo) {
    //         participant['jobtitle'] = officer.cargo.nombre;
    //       }
    //     }
    //   } else {
    //     const officer = await this.officerModel
    //       .findById(mail.emisor.funcionario._id)
    //       .populate('cargo', 'nombre');
    //     participant['fullname'] = [
    //       officer.nombre,
    //       officer.paterno,
    //       officer.materno,
    //     ]
    //       .filter(Boolean)
    //       .join(' ');
    //     if (officer.cargo) {
    //       participant['jobtitle'] = officer.cargo.nombre;
    //     }
    //   }
    //   await this.inboxModel.findByIdAndUpdate(mail._id, {
    //     emisor: { cuenta: mail.emisor.cuenta._id, ...participant },
    //   });
    //   console.log('ok');
    // }
    // console.log('end');
  }
  async getAccountForSend(id_dependencie: string, id_account: string) {
    return await this.accountModel
      .find({
        dependencia: id_dependencie,
        activo: true,
        funcionario: { $ne: null },
        _id: { $ne: id_account },
      })
      .select('_id')
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
          select: 'nombre',
        },
      });
  }

  async search(
    id_account: string,
    text: string,
    limit: number,
    offset: number,
  ) {
    // const regex = new RegExp(text, 'i');
    // const data = await this.inboxModel.aggregate([
    //   {
    //     $match: {
    //       'receptor.cuenta': new mongoose.Types.ObjectId(id_account),
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'procedures',
    //       localField: 'tramite',
    //       foreignField: '_id',
    //       as: 'tramite',
    //     },
    //   },
    //   {
    //     $unwind: '$tramite',
    //   },
    //   {
    //     $match: {
    //       $or: [
    //         { 'tramite.code': regex },
    //         { 'tramite.reference': regex },
    //         { 'emisor.fullname': regex },
    //       ],
    //     },
    //   },
    //   {
    //     $facet: {
    //       paginatedResults: [{ $skip: offset }, { $limit: limit }],
    //       totalCount: [
    //         {
    //           $count: 'count',
    //         },
    //       ],
    //     },
    //   },
    // ]);
    // const mails = data[0].paginatedResults;
    // const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    // return { mails, length };
  }

  async findAll(id_account: string, { limit, offset }: PaginationParamsDto) {
    const query: mongoose.FilterQuery<Communication> = {
      'receiver.cuenta': id_account,
      $or: [{ status: 'received' }, { status: 'pending' }],
    };
    const [mails, length] = await Promise.all([
      this.communicationModel
        .find(query)
        .skip(offset)
        .limit(limit)
        .sort({ outboundDate: -1 })
        .populate('procedure'),
      this.communicationModel.count(query),
    ]);
    return { mails, length };
  }

  async create(communication: CreateCommunicationDto, account: Account) {
    const { id_mail, id_procedure, receivers } = communication;
    await this.verifyDuplicateSend(id_procedure, receivers);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (id_mail) {
        await this.communicationModel.updateOne(
          { _id: id_mail },
          { status: statusMail.Completed },
          { session },
        );
      }
      const mails = await this.createMailData(account, communication);
      const createdMails = await this.communicationModel.insertMany(mails, {
        session,
      });
      await this.communicationModel.populate(createdMails, {
        path: 'procedure',
        select: 'code reference state send',
      });
      await this.markProcedureAsSend(createdMails[0].procedure, session);
      await session.commitTransaction();
      return createdMails;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al enviar el tramite');
    } finally {
      session.endSession();
    }
  }

  async createMailData(
    emitterAccount: Account,
    communication: CreateCommunicationDto,
  ): Promise<Communication[]> {
    const { receivers, id_procedure, ...values } = communication;
    const { _id, funcionario } = await this.accountModel.populate(
      emitterAccount,
      {
        path: 'funcionario',
        select: 'nombre paterno materno cargo',
        populate: {
          path: 'cargo',
          select: 'nombre',
        },
      },
    );
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

  async markProcedureAsSend(
    procedure: Procedure,
    session: mongoose.mongo.ClientSession,
  ) {
    if (procedure.send) return;
    await this.procedureModel.updateOne(
      { _id: procedure._id },
      { send: true },
      { session },
    );
  }

  async acceptMail(id_mail: string) {
    const mailDB = await this.communicationModel
      .findById(id_mail)
      .populate('procedure', 'state');
    if (!mailDB)
      throw new BadRequestException('El envio del tramite ha sido cancelado');
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
      return procedure.state;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Ha ocurrido un error al aceptar el tramite',
      );
    } finally {
      await session.endSession();
    }
  }

  async rejectMail(id_mail: string, rejectionReason: string) {
    const mailDB = await this.communicationModel.findById(id_mail);
    if (!mailDB)
      throw new BadRequestException('El envio del tramite ha sido cancelado');
    const session = await this.connection.startSession();
    try {
      const { procedure, emitter } = mailDB;
      session.startTransaction();
      await this.communicationModel.updateOne(
        { _id: id_mail },
        {
          status: statusMail.Rejected,
          inboundDate: new Date(),
          rejectionReason,
        },
        { session },
      );
      const recoveredMail = await this.recoverLastMail(
        procedure._id,
        emitter.cuenta._id,
        session,
      );
      await session.commitTransaction();
      return recoveredMail;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException('No se pudo rechazar el tramite');
    } finally {
      await session.endSession();
    }
  }

  async getMail() {
    // const mail = await this.inboxModel
    //   .findById(id_inbox)
    //   .populate('tramite')
    //   .populate({
    //     path: 'emisor.cuenta',
    //     select: 'dependencia',
    //     populate: {
    //       path: 'dependencia',
    //       select: 'nombre',
    //       populate: {
    //         path: 'institucion',
    //         select: 'nombre',
    //       },
    //     },
    //   });
    // if (!mail)
    //   throw new BadRequestException(
    //     'El envio de este tramite ha sido cancelado',
    //   );
    // return mail;
  }
  async recoverLastMail(
    id_procedure: string,
    id_currentEmitter: string,
    session: mongoose.mongo.ClientSession,
  ) {
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
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        { send: false },
        { session },
      );
    }
    return lastMailSend;
  }

  async getLocationProcedure(id_procedure: string) {
    // return await this.inboxModel
    //   .find({ tramite: id_procedure })
    //   .select('receptor')
    //   .populate({
    //     path: 'receptor.cuenta',
    //     select: 'funcionario dependencia',
    //     populate: [
    //       {
    //         path: 'funcionario',
    //         select: 'nombre paterno materno cargo',
    //         populate: {
    //           path: 'cargo',
    //           select: 'nombre',
    //         },
    //       },
    //       {
    //         path: 'dependencia',
    //         select: 'nombre',
    //       },
    //     ],
    //   });
  }
}
