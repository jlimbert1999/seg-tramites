import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Archivos } from '../schemas/archivos.schema';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { Communication, ProcedureEvents, Procedure } from '../schemas';
import { EventProcedureDto } from '../dto';
import { stateProcedure, statusMail } from '../interfaces';
import { Account } from 'src/administration/schemas';
import { createFullName } from 'src/administration/helpers/fullname';

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

  async archiveProcedure(
    eventProcedureDto: EventProcedureDto,
    account: Account,
  ) {
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

  async archiveMail(
    id_mail: string,
    archiveDto: EventProcedureDto,
    account: Account,
  ) {
    const { status, procedure } = await this.communicationModel.findById(
      id_mail,
    );
    if (status !== statusMail.Received)
      throw new BadRequestException('El envio no puede archivarse.');
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
      await this.createProcedureEvent(archiveDto, account, session);
      await this.checkIfProcedureIsCompleted(procedure._id, session);
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

  async unarchiveMail(
    id_mail: string,
    eventDto: EventProcedureDto,
    account: Account,
  ) {
    const { status, receiver } = await this.communicationModel.findById(
      id_mail,
    );
    if (status !== statusMail.Archived)
      throw new BadRequestException('El tramite ya fue desarchivado');
    // const session = await this.connection.startSession();
    try {
      // session.startTransaction();
      if (String(receiver.cuenta._id) === String(account._id)) {
        await this.communicationModel.updateOne(
          { _id: id_mail },
          { status: statusMail.Received },
        );
      } else {
      }
      // await this.createProcedureEvent({procedure:, ...description}, account, session);
      // await session.commitTransaction();
      return { message: 'tramite desarchivado' };
    } catch (error) {
      // await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar tramite', {
        cause: error,
      });
    } finally {
      // session.endSession();
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
        .populate('procedure', 'code reference endDate'),
      this.communicationModel.count({
        status: statusMail.Archived,
        'receiver.cuenta': { $in: officersInDependency },
      }),
    ]);
    return { archives, length };
  }

  async createProcedureEvent(
    eventProcedureDto: EventProcedureDto,
    account: Account,
    session: mongoose.mongo.ClientSession,
  ) {
    const { funcionario } = await account.populate('funcionario');
    const createdEvent = new this.procedureEventModel({
      procedure: eventProcedureDto.procedure,
      description: eventProcedureDto.description,
      fullNameOfficer: createFullName(funcionario),
    });
    await createdEvent.save({ session });
  }

  async checkIfProcedureCanBeCompleted(id_procedure: string) {
    const { state, code } = await this.procedureModel.findById(id_procedure);
    if (state === stateProcedure.CONCLUIDO)
      throw new BadRequestException(`El tramite ${code} ya fue concluido.`);
    const isProcessStarted = await this.communicationModel.findOne({
      procedure: id_procedure,
    });
    if (isProcessStarted)
      throw new BadRequestException(
        'Solo puede concluir tramites que no hayan sido remitidos',
      );
  }

  async checkIfProcedureIsCompleted(
    id_procedure: string,
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
          state: stateProcedure.CONCLUIDO,
          endDate: new Date(),
        },
        { session },
      );
    }
  }
}
