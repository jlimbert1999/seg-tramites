import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Archivos } from '../schemas/archivos.schema';
import { PaginationParamsDto } from 'src/common/interfaces/pagination_params';
import { Communication, ProcedureEvents, Procedure } from '../schemas';
import { EventProcedureDto } from '../dto';
import { stateProcedure, statusMail } from '../interfaces';
import { createFullName } from 'src/administration/helpers/fullname';
import { Account } from 'src/auth/schemas/account.schema';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Archivos.name) private oldArchiveModel: Model<Archivos>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(ProcedureEvents.name)
    private procedureEventModel: Model<ProcedureEvents>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
  ) {}

  async getOldArchives({ limit, offset }: PaginationParamsDto) {
    return await this.oldArchiveModel.find({}).limit(limit).skip(offset);
  }

  async archiveProcedure(eventProcedureDto: EventProcedureDto, account: Account) {
    const { procedure } = eventProcedureDto;
    await this.checkIfProcedureCanBeCompleted(procedure);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.procedureModel.updateOne(
        { _id: procedure },
        {
          state: stateProcedure.CONCLUIDO,
          endDate: new Date(),
        },
        { session },
      );
      await this.createProcedureEvent(eventProcedureDto, account, session);
      await session.commitTransaction();
      return { message: 'Tramite archivado' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar tramite', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async archiveMail(id_mail: string, eventDto: EventProcedureDto, account: Account) {
    const { status, procedure } = await this.communicationModel.findById(id_mail);
    if (status !== statusMail.Received) throw new BadRequestException('El envio no puede archivarse.');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.communicationModel.updateOne(
        { _id: id_mail },
        {
          status: statusMail.Archived,
        },
        { session },
      );
      await this.createProcedureEvent(eventDto, account, session);
      await this.checkIfProcedureIsCompleted(procedure._id, eventDto.stateProcedure, session);
      await session.commitTransaction();
      return { message: 'Tramite archivado.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar envio', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async unarchiveMail(id_mail: string, eventDto: EventProcedureDto, account: Account) {
    const mailDB = await this.communicationModel.findById(id_mail);
    if (mailDB.status !== statusMail.Archived) throw new BadRequestException('El tramite ya fue desarchivado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (String(mailDB.receiver.cuenta._id) === String(account._id)) {
        await this.communicationModel.updateOne({ _id: id_mail }, { status: statusMail.Received });
      } else {
        await this.insertPartipantInToWokflow(mailDB, account, session);
      }
      await this.createProcedureEvent(eventDto, account, session);
      await session.commitTransaction();
      return { message: 'Tramite desarchivado.' };
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al desarchivar tramite', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async findAll({ limit, offset }: PaginationParamsDto, account: Account) {
    const officersInDependency = await this.accountModel
      .find({
        dependencia: account.dependencia._id,
      })
      .select('_id');

    const [archives, length] = await Promise.all([
      this.communicationModel
        .find({
          status: statusMail.Archived,
          'receiver.cuenta': { $in: officersInDependency },
        })
        .limit(limit)
        .skip(offset)
        .sort({ _id: -1 })
        .select('procedure receiver')
        .populate('procedure'),
      this.communicationModel.count({
        status: statusMail.Archived,
        'receiver.cuenta': { $in: officersInDependency },
      }),
    ]);
    return { archives, length };
  }
  async search(text: string, { limit, offset }: PaginationParamsDto, account: Account) {
    const officersInDependency = await this.accountModel
      .find({
        dependencia: account.dependencia._id,
      })
      .select('_id');
    const ids_officers = officersInDependency.map((officer) => officer._id);
    const regex = new RegExp(text, 'i');
    const data = await this.communicationModel.aggregate([
      {
        $match: {
          status: statusMail.Archived,
          'receiver.cuenta': { $in: ids_officers },
        },
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
    const archives = data[0].paginatedResults;
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { archives, length };
  }
  async createProcedureEvent(
    { description, procedure }: EventProcedureDto,
    account: Account,
    session: mongoose.mongo.ClientSession,
  ) {
    const { funcionario } = await account.populate('funcionario');
    const createdEvent = new this.procedureEventModel({
      procedure,
      description,
      fullNameOfficer: createFullName(funcionario),
    });
    await createdEvent.save({ session });
  }
  async checkIfProcedureCanBeCompleted(id_procedure: string) {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (procedureDB.state === stateProcedure.CONCLUIDO)
      throw new BadRequestException(`El tramite ${procedureDB.code} ya fue concluido.`);
    const isProcessStarted = await this.communicationModel.findOne({
      procedure: id_procedure,
    });
    if (isProcessStarted) throw new BadRequestException('Solo puede concluir tramites que no hayan sido remitidos');
  }
  async checkIfProcedureIsCompleted(
    id_procedure: string,
    stateCompleted: stateProcedure.SUSPENDIDO | stateProcedure.CONCLUIDO,
    session: mongoose.mongo.ClientSession,
  ) {
    const isProcessActive = await this.communicationModel.findOne({
      procedure: id_procedure,
      $or: [{ status: statusMail.Pending }, { status: statusMail.Received }],
    });
    if (!isProcessActive) {
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        {
          state: stateCompleted,
          endDate: new Date(),
        },
        { session },
      );
    }
  }
  async insertPartipantInToWokflow(
    currentMail: Communication,
    participant: Account,
    session: mongoose.mongo.ClientSession,
  ) {
    const inboundDate = new Date();
    const outboundDate = new Date(inboundDate.getTime() + 1000);
    const { receiver, attachmentQuantity, internalNumber } = currentMail;
    const { funcionario } = await participant.populate({
      path: 'funcionario',
      populate: { path: 'cargo', select: 'nombre' },
    });
    const newMail = {
      procedure: currentMail.procedure._id,
      emitter: receiver,
      receiver: {
        cuenta: participant._id,
        fullname: createFullName(funcionario),
        ...(funcionario.cargo && { jobtitle: funcionario.cargo.nombre }),
      },
      outboundDate,
      inboundDate,
      reference: 'Para su continuacion',
      attachmentQuantity: attachmentQuantity,
      internalNumber: internalNumber,
      status: statusMail.Received,
    };
    const createdMail = new this.communicationModel(newMail);
    await createdMail.save({ session });
  }
  async getProcedureEvents(id_procedure: string) {
    return await this.procedureEventModel.find({ procedure: id_procedure }).sort({ date: -1 });
  }
}
