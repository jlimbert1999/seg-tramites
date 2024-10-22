import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, FilterQuery, Model } from 'mongoose';

import { Procedure, ProcedureBase } from '../../procedures/schemas';
import { stateProcedure, StatusMail } from '../../procedures/interfaces';
import {
  GetInboxParamsDto,
  ReceiverDto,
  UpdateCommunicationDto,
} from '../../procedures/dto';
import { Account } from 'src/modules/administration/schemas';
import { Communication } from '../schemas/communication.schema';
import { CreateCommunicationDto } from '../dtos/communication.dto';

@Injectable()
export class InboxService {
  constructor(
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
    @InjectModel(ProcedureBase.name)
    private procedureModel: Model<ProcedureBase>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getMailDetails(id_mail: string, { _id }: Account) {
    // const mailDB = await this.commModel.findById(id_mail).populate('procedure');
    // if (!mailDB)
    //   throw new BadRequestException(
    //     'El envio de este tramite ha sido cancelado',
    //   );
    // if (String(_id) !== String(mailDB.receiver.cuenta._id))
    //   throw new ForbiddenException();
    // return mailDB;
  }

  async findAll(
    id_account: string,
    { limit, offset, status }: GetInboxParamsDto,
  ) {
    const query: FilterQuery<Communication> = { 'receiver.cuenta': id_account };
    status
      ? (query.status = status)
      : (query.$or = [
          { status: StatusMail.Received },
          { status: StatusMail.Pending },
        ]);
    const [mails, length] = await Promise.all([
      this.communicationModel
        .find(query)
        .skip(offset)
        .limit(limit)
        .sort({ outboundDate: -1 })
        .populate('procedure')
        .lean(),
      this.communicationModel.count(query),
    ]);
    return { mails, length };
  }

  async search(
    id_account: string,
    term: string,
    { limit, offset, status }: GetInboxParamsDto,
  ) {
    const regex = new RegExp(term, 'i');
    const query: FilterQuery<Communication> = { 'receiver.cuenta': id_account };
    status
      ? (query.status = status)
      : (query.$or = [
          { status: StatusMail.Received },
          { status: StatusMail.Pending },
        ]);
    const [data] = await this.communicationModel
      .aggregate()
      .match(query)
      .lookup({
        from: 'procedures',
        localField: 'procedure',
        foreignField: '_id',
        as: 'procedure',
      })
      .unwind('$procedure')
      .match({
        $or: [{ 'procedure.code': regex }, { 'procedure.reference': regex }],
      })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const mails = data.paginatedResults;
    const length = data.totalCount[0] ? data.totalCount[0].count : 0;
    return { mails, length };
  }

  async create(communicationDto: CreateCommunicationDto, account: Account) {
    const { procecureId, receivers, mailId } = communicationDto;
    await this._checkIfMailHasDuplicate(
      procecureId,
      receivers.map(({ cuenta }) => cuenta),
    );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (mailId) {
        // await this.communicationModel.updateOne(
        //   { _id: communication.id_mail },
        //   { status: StatusMail.Completed },
        //   { session },
        // );
        const current = await this.communicationModel.findById(mailId);
        if (current.isOriginal) {

        } else {
          
        }
        await this.communicationModel.updateOne(
          { _id: mailId },
          {
            status:
              current.status === StatusMail.Rejected
                ? StatusMail.Forwarding
                : StatusMail.Completed,
          },
        );
      } else {
        const hasOriginal = receivers.some(({ isOriginal }) => isOriginal);
        if (!hasOriginal) {
          throw new BadRequestException('Debe enviar el orininal');
        }
        // await this.procedureModel.updateOne(
        //   { _id: communication.id_procedure, send: false },
        //   { send: true, state: stateProcedure.EN_REVISION },
        //   { session },
        // );
        // if (result.modifiedCount === 0) {
        //   throw new BadRequestException('El tramite ha ya sido remitido');
        // }
        await this.procedureModel.updateOne(
          { _id: procecureId },
          { state: stateProcedure.EN_REVISION },
          { session },
        );
      }
      const models = this._dtoToModel(account, communicationDto);
      const results = await this.communicationModel.insertMany(models, {
        session,
      });
      await this.communicationModel.populate(results, 'procedure');
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }
  }

  async accept(id: string) {
    const mailDB = await this.communicationModel.findById(id);
    if (!mailDB)
      throw new NotFoundException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== StatusMail.Pending)
      throw new BadRequestException('El tramite ya ha sido aceptado');
    await this.communicationModel.updateOne(
      { _id: id },
      { status: StatusMail.Received, inboundDate: new Date() },
    );
    return { message: 'Tramite aceptado correctamente.' };
  }

  async reject(
    id: string,
    account: Account,
    { description }: UpdateCommunicationDto,
  ) {
    const mailDB = await this.communicationModel.findById(id);
    if (!mailDB)
      throw new NotFoundException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== StatusMail.Pending)
      throw new BadRequestException('El tramite ya fue rechazado');
    const session = await this.connection.startSession();
    try {
      // session.startTransaction();
      // const { procedure, emitter } = mailDB;
      // const { officer } = await account.populate('funcionario');
      // const date = new Date();
      // await this.commModel.updateOne(
      //   { _id: id },
      //   {
      //     status: StatusMail.Rejected,
      //     inboundDate: date,
      //     eventLog: {
      //       // TODO repair fullname

      //       manager: '',
      //       description: description,
      //       date: date,
      //     },
      //   },
      //   { session },
      // );
      // await this.restoreStage(procedure._id, emitter.cuenta._id, session);
      await session.commitTransaction();
      return { message: 'Tramite rechazado.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error en rechazo del tramite');
    } finally {
      await session.endSession();
    }
  }

  async cancelMails(
    ids_mails: string[],
    id_procedure: string,
    id_emitter: string,
  ) {
    const canceledMails = await this.checkIfMailsHaveBeenReceived(ids_mails);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.communicationModel.deleteMany(
        { _id: { $in: ids_mails } },
        { session },
      );
      const recoveredMail = await this.restoreStage(
        id_procedure,
        id_emitter,
        session,
      );
      await session.commitTransaction();
      return {
        message: `El tramite ahora se encuentra en su ${
          recoveredMail ? 'bandeja de entrada' : 'administracion de tramites'
        } para su reenvio.`,
        mails: canceledMails,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Ha ocurrido un error al cancelar un envio',
      );
    } finally {
      await session.endSession();
    }
  }

  private async _checkIfMailHasDuplicate(
    procedureId: string,
    receiversIds: string[],
  ): Promise<void> {
    const duplicate = await this.communicationModel.findOne({
      procedure: procedureId,
      $or: [{ status: StatusMail.Pending }, { status: StatusMail.Received }],
      'receiver.cuenta': { $in: receiversIds },
    });
    if (!duplicate) {
      throw new BadRequestException('El tramite ya se encuentra en bandeja');
    }
  }

  private async checkIfMailsHaveBeenReceived(
    ids_mails: string[],
  ): Promise<Communication[]> {
    const mails = await this.communicationModel.find({
      _id: { $in: ids_mails },
    });
    if (mails.length === 0)
      throw new BadRequestException('Los envios ya han sido cancelados');
    const receivedMail = mails.find(
      (mail) => mail.status !== StatusMail.Pending,
    );
    // if (receivedMail) {
    //   throw new BadRequestException(
    //     `El tramite ya ha sido ${
    //       receivedMail.status === StatusMail.Rejected ? 'rechazado' : 'recibido'
    //     } por el funcionario ${receivedMail.receiver.fullname}`,
    //   );
    // }
    return mails;
  }

  private async restoreStage(
    id_procedure: string,
    id_emiter: string,
    session: ClientSession,
  ): Promise<Communication | undefined> {
    const lastStage = await this.communicationModel.findOneAndUpdate(
      {
        procedure: id_procedure,
        'receiver.cuenta': id_emiter,
        $or: [
          { status: StatusMail.Completed },
          { status: StatusMail.Received },
        ],
      },
      { status: StatusMail.Received },
      { session, sort: { _id: -1 }, new: true },
    );
    if (!lastStage) {
      const isProcessStarted = await this.communicationModel.findOne(
        { procedure: id_procedure, status: { $ne: StatusMail.Rejected } },
        null,
        { session },
      );
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        {
          send: false,
          ...(!isProcessStarted && { state: stateProcedure.INSCRITO }),
        },
        { session },
      );
    }
    return lastStage;
  }

  private _dtoToModel(
    { _id, officer, jobtitle }: Account,
    communication: CreateCommunicationDto,
  ): Communication[] {
    const { receivers, procecureId, ...values } = communication;
    const sentDate = new Date();
    const sender = {
      cuenta: _id,
      fullname: officer.fullName,
      jobtitle: jobtitle,
    };
    return receivers.map(
      (receiver) =>
        new this.communicationModel({
          sender: sender,
          procedure: procecureId,
          receiver: {
            cuenta: receiver.cuenta,
            fullname: receiver.fullname,
            jobtitle: receiver.jobtitle,
          },
          sentDate,
          ...values,
        }),
    );
  }
}
