import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

import { Account } from 'src/users/schemas';
import { Procedure, Communication } from '../schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { CreateCommunicationDto, GetInboxParamsDto, ReceiverDto, UpdateCommunicationDto } from '../dto';
import { fullname } from 'src/administration/helpers/fullname';
import { HumanizeTime } from 'src/common/helpers';
import { stateProcedure, StatusMail, workflow } from '../interfaces';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectModel(Communication.name) private commModel: Model<Communication>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async getMailDetails(id_mail: string) {
    const mailDB = await this.commModel.findById(id_mail).populate('procedure');
    if (!mailDB) throw new BadRequestException('El envio de este tramite ha sido cancelado');
    return mailDB;
  }

  async getInbox(id: string, { limit, offset, status }: GetInboxParamsDto) {
    const query: FilterQuery<Communication> = { 'receiver.cuenta': id };
    status ? (query.status = status) : (query.$or = [{ status: StatusMail.Received }, { status: StatusMail.Pending }]);
    const [mails, length] = await Promise.all([
      this.commModel.find(query).skip(offset).limit(limit).sort({ outboundDate: -1 }).populate('procedure').lean(),
      this.commModel.count(query),
    ]);
    return { mails, length };
  }

  async searchInbox(id: string, term: string, { limit, offset, status }: GetInboxParamsDto) {
    const regex = new RegExp(term, 'i');
    const query: mongoose.FilterQuery<Communication> = { 'receiver.cuenta': id };
    status ? (query.status = status) : (query.$or = [{ status: StatusMail.Received }, { status: StatusMail.Pending }]);
    const [data] = await this.commModel
      .aggregate()
      .match(query)
      .lookup({
        from: 'procedures',
        localField: 'procedure',
        foreignField: '_id',
        as: 'procedure',
      })
      .unwind('$procedure')
      .match({ $or: [{ 'procedure.code': regex }, { 'procedure.reference': regex }] })
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

  async getOutbox(id: string, { limit, offset }: PaginationParamsDto) {
    const dataPaginated = await this.commModel
      .aggregate()
      .match({ 'emitter.cuenta': id, status: StatusMail.Pending })
      .group({
        _id: {
          account: '$emitter.cuenta',
          procedure: '$procedure',
          outboundDate: '$outboundDate',
        },
        sendings: { $push: '$$ROOT' },
      })
      .lookup({
        from: 'procedures',
        localField: '_id.procedure',
        foreignField: '_id',
        as: '_id.procedure',
      })
      .unwind('_id.procedure')
      .sort({ '_id.outboundDate': -1 })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0;
    return { mails, length };
  }

  async searchOutbox(id_account: string, text: string, { limit, offset }: PaginationParamsDto) {
    const regex = new RegExp(text, 'i');
    const dataPaginated = await this.commModel
      .aggregate()
      .match({
        'emitter.cuenta': id_account,
        status: StatusMail.Pending,
      })
      .group({
        _id: {
          account: '$emitter.cuenta',
          procedure: '$procedure',
          outboundDate: '$outboundDate',
        },
        sendings: { $push: '$$ROOT' },
      })
      .lookup({
        from: 'procedures',
        localField: '_id.procedure',
        foreignField: '_id',
        as: '_id.procedure',
      })
      .unwind('_id.procedure')
      .match({ $or: [{ '_id.procedure.code': regex }, { '_id.procedure.reference': regex }] })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0;
    return { mails, length };
  }

  async create(communication: CreateCommunicationDto, account: Account): Promise<Communication[]> {
    await this.checkIfMailHasDuplicate(communication.id_procedure, communication.receivers);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (communication.id_mail) {
        await this.commModel.updateOne({ _id: communication.id_mail }, { status: StatusMail.Completed }, { session });
      } else {
        const result = await this.procedureModel.updateOne(
          { _id: communication.id_procedure, send: false },
          { send: true },
          { session },
        );
        if (result.modifiedCount === 0) {
          throw new BadRequestException('El tramite ha ya sido remitido');
        }
      }
      const mails = await this.createModel(account, communication);
      const createdMails = await this.commModel.insertMany(mails, { session });
      await this.commModel.populate(createdMails, 'procedure');
      await session.commitTransaction();
      return mails;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al enviar el tramite');
    } finally {
      session.endSession();
    }
  }

  private async createModel(account: Account, communication: CreateCommunicationDto): Promise<Communication[]> {
    const { id_procedure, ...values } = communication;
    await account.populate({
      path: 'funcionario',
      select: 'nombre paterno materno cargo',
      populate: {
        path: 'cargo',
        select: 'nombre',
      },
    });
    const emitter = {
      cuenta: account._id,
      fullname: fullname(account.funcionario),
      ...(account.funcionario.cargo && { jobtitle: account.funcionario.cargo.nombre }),
    };
    const outboundDate = new Date();
    return communication.receivers.map((receiver) => {
      return new this.commModel({
        procedure: id_procedure,
        outboundDate,
        emitter,
        receiver,
        ...values,
      });
    });
  }

  async accept(id: string) {
    const mailDB = await this.commModel.findById(id).populate('procedure', 'state');
    if (!mailDB) throw new NotFoundException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== StatusMail.Pending) throw new BadRequestException('El tramite ya ha sido aceptado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { procedure } = mailDB;
      await this.commModel.updateOne(
        { _id: id },
        { status: StatusMail.Received, inboundDate: new Date() },
        { session },
      );
      if (procedure.state !== stateProcedure.OBSERVADO && procedure.state !== stateProcedure.EN_REVISION) {
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

  async reject(id: string, account: Account, { description }: UpdateCommunicationDto) {
    const mailDB = await this.commModel.findById(id);
    if (!mailDB) throw new NotFoundException('El envio del tramite ha sido cancelado');
    if (mailDB.status !== StatusMail.Pending) throw new BadRequestException('El tramite ya fue rechazado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { procedure, emitter } = mailDB;
      const { funcionario } = await account.populate('funcionario');
      const date = new Date();
      await this.commModel.updateOne(
        { _id: id },
        {
          status: StatusMail.Rejected,
          inboundDate: date,
          eventLog: {
            manager: fullname(funcionario),
            description: description,
            date: date,
          },
        },
        { session },
      );
      await this.restoreProcessStage(procedure._id, emitter.cuenta._id, session);
      await session.commitTransaction();
      return { message: 'Tramite rechazado.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error en rechazo del tramite');
    } finally {
      await session.endSession();
    }
  }

  async cancelMails(ids_mails: string[], id_procedure: string, id_emitter: string) {
    const canceledMails = await this.checkIfMailsHaveBeenReceived(ids_mails);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.commModel.deleteMany({ _id: { $in: ids_mails } }, { session });
      const recoveredMail = await this.restoreProcessStage(id_procedure, id_emitter, session);
      await session.commitTransaction();
      return {
        message: `El tramite ahora se encuentra en su ${
          recoveredMail ? 'bandeja de entrada' : 'administracion de tramites'
        } para su reenvio.`,
        mails: canceledMails,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Ha ocurrido un error al cancelar un envio');
    } finally {
      await session.endSession();
    }
  }

  private async checkIfMailHasDuplicate(id_procedure: string, receivers: ReceiverDto[]): Promise<void> {
    const mail = await this.commModel.findOne({
      procedure: id_procedure,
      $or: [{ status: StatusMail.Pending }, { status: StatusMail.Received }],
      'receiver.cuenta': { $in: receivers.map((receiver) => receiver.cuenta) },
    });
    if (!mail) return;
    const receiver = receivers.find(({ cuenta }) => cuenta === String(mail.receiver.cuenta._id));
    throw new BadRequestException(`${receiver.fullname} ya tiene el tramite en su bandeja.`);
  }

  private async checkIfMailsHaveBeenReceived(ids_mails: string[]): Promise<Communication[]> {
    const mails = await this.commModel.find({ _id: { $in: ids_mails } });
    if (mails.length === 0) throw new BadRequestException('Los envios ya han sido cancelados');
    const receivedMail = mails.find((mail) => mail.status !== StatusMail.Pending);
    if (receivedMail) {
      throw new BadRequestException(
        `El tramite ya ha sido ${
          receivedMail.status === StatusMail.Rejected ? 'rechazado' : 'recibido'
        } por el funcionario ${receivedMail.receiver.fullname}`,
      );
    }
    return mails;
  }

  private async restoreProcessStage(
    id_procedure: string,
    id_emiter: string,
    session: mongoose.mongo.ClientSession,
  ): Promise<Communication | undefined> {
    const lastStage = await this.commModel.findOneAndUpdate(
      {
        procedure: id_procedure,
        'receiver.cuenta': id_emiter,
        $or: [{ status: StatusMail.Completed }, { status: StatusMail.Received }],
      },
      { status: StatusMail.Received },
      { session, sort: { _id: -1 }, new: true },
    );
    if (!lastStage) {
      await this.procedureModel.updateOne({ _id: id_procedure }, { send: false }, { session });
    }
    return lastStage;
  }

  async getWorkflow(id_procedure: string) {
    const workflow: workflow[] = await this.commModel
      .aggregate()
      .match({ procedure: new mongoose.Types.ObjectId(id_procedure) })
      .group({
        _id: { emitter: '$emitter', outboundDate: '$outboundDate' },
        dispatches: {
          $push: '$$ROOT',
        },
      })
      .sort({ '_id.outboundDate': 1 })
      .project({ 'dispatches.emitter': 0, 'dispatches.outboundDate': 0 });
    return await this.timedWorkflow(workflow, id_procedure);
  }

  private async timedWorkflow(workflow: workflow[], id_procedure: string) {
    const { startDate } = await this.procedureModel.findById(id_procedure, 'startDate');
    const receptionList: Record<string, Date> = {};
    const stages = workflow.map(({ _id, dispatches }) => {
      dispatches.forEach((el) => (receptionList[el.receiver.cuenta] = el.inboundDate));
      const start = receptionList[_id.emitter.cuenta] ?? startDate;
      return {
        ..._id,
        duration: start ? HumanizeTime(_id.outboundDate.getTime() - start.getTime()) : 'No calculado',
        dispatches: dispatches.map((dispatch) => {
          const duration = dispatch.inboundDate
            ? HumanizeTime(dispatch.inboundDate.getTime() - _id.outboundDate.getTime())
            : 'Pendiente';
          return { ...dispatch, duration };
        }),
      };
    });
    return stages;
  }

  async getLocation(id_procedure: string) {
    const invalidStatus = [StatusMail.Completed, StatusMail.Rejected];
    const location = await this.commModel
      .find({ procedure: id_procedure, status: { $nin: invalidStatus } })
      .select({ 'receiver.cuenta': 1, status: 1, _id: 0 })
      .populate({
        path: 'receiver.cuenta',
        select: 'funcionario',
        populate: [
          {
            path: 'funcionario',
            select: 'nombre paterno materno cargo -_id',
            populate: {
              path: 'cargo',
              select: 'nombre -_id',
            },
          },
          {
            path: 'dependencia',
            select: 'nombre -_id',
          },
        ],
      })
      .lean();
    return location.map((el) => ({ ...el.receiver.cuenta, status: el.status }));
  }
}
