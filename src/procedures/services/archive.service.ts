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
import { ArchiveDto } from '../dto';
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
    id_procedure: string,
    archiveDto: ArchiveDto,
    account: Account,
  ) {
    await this.checkIfProcedureCanBeCompleted(id_procedure);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        {
          state: archiveDto.state,
          endDate: new Date(),
          completionReason: archiveDto.description,
        },
        { session },
      );
      await this.createProcedureEvent(archiveDto, account, session);
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

  async archiveMail(id_mail: string, archiveDto: ArchiveDto, account: Account) {
    const { status, procedure } = await this.communicationModel.findById(
      id_mail,
    );
    if (status !== statusMail.Received)
      throw new BadRequestException('El tramite ya no puede archivarse.');
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
      const isProcessActive = await this.communicationModel.findOne({
        procedure: procedure._id,
        $or: [{ status: statusMail.Pending }, { status: statusMail.Received }],
      });
      if (!isProcessActive) {
        await this.procedureModel.updateOne(
          { _id: procedure._id },
          {
            state: stateProcedure.CONCLUIDO,
            endDate: new Date(),
            completionReason: archiveDto.description,
          },
          { session },
        );
      }
      await this.createProcedureEvent(archiveDto, account, session);
      await session.commitTransaction();
      return 'Tramite archivado';
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar tramite', {
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
    return await this.communicationModel
      .find({ 'receiver.cuenta': { $in: officersInDependency } })
      .limit(limit)
      .skip(offset)
      .sort({ _id: -1 })
      .select('procedure receiver')
      .populate('procedure', 'code endDate completionReason');
  }

  async Unarchive(id_mail: string, account: Account, eventDto: ArchiveDto) {
    // const mailDB = await this.communicationModel.findById(id_mail);
    // if (status !== statusMail.Archived)
    //   throw new BadRequestException('El tramite ya fue desarchivado');
    // const session = await this.connection.startSession();
    // try {
    //   session.startTransaction();
    //   const {receiver, _id, ...values}=mailDB
    //   if (receiver.cuenta._id !== account._id) {
    //     await this.communicationModel.
    //   } else {
    //   }
    //   await this.communicationModel.updateOne(
    //     { _id: id_mail },
    //     {
    //       status: statusMail.Received,
    //     },
    //     { session },
    //   );
    //   await this.restartProcedure(procedure._id, session);
    //   await this.createEvent(procedure._id, archiveDto, account, session);
    //   await session.commitTransaction();
    //   return 'Tramite desarchivado';
    // } catch (error) {
    //   console.log(error);
    //   await session.abortTransaction();
    //   throw new InternalServerErrorException('Error al archivar tramite', {
    //     cause: error,
    //   });
    // } finally {
    //   session.endSession();
    // }
  }

  async restartProcedure(
    id_procedure: string,
    session: mongoose.mongo.ClientSession,
  ) {
    await this.procedureModel.updateOne(
      {
        _id: id_procedure,
      },
      {
        state: stateProcedure.EN_REVISION,
        $unset: { endDate: 1, completionReason: 1 },
      },
      { session },
    );
  }

  async createProcedureEvent(
    { description, procedure }: ArchiveDto,
    account: Account,
    session: mongoose.mongo.ClientSession,
  ) {
    const { funcionario } = await account.populate('funcionario');
    const createdEvent = new this.procedureEventModel({
      procedure,
      fullNameOfficer: createFullName(funcionario),
      description,
    });
    await createdEvent.save({ session });
  }

  async checkIfProcedureCanBeCompleted(id_procedure: string) {
    const { state, code } = await this.procedureModel.findById(id_procedure);
    if (state === stateProcedure.CONCLUIDO)
      throw new BadRequestException(`El tramite ${code} ya fue concluido`);
    const isProcessStarted = await this.communicationModel.findOne({
      procedure: id_procedure,
    });
    if (isProcessStarted)
      throw new BadRequestException(
        'Solo puede concluir tramites que no hayan sido remitidos',
      );
  }
}
