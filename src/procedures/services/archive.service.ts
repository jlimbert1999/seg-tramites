import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Archivos } from '../schemas/archivos.schema';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { Communication, EventProcedure, Procedure } from '../schemas';
import { CreateArchiveDto } from '../dto';
import { stateProcedure, statusMail } from '../interfaces';
import { Account } from 'src/administration/schemas';
import { createFullName } from 'src/administration/helpers/fullname';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Archivos.name) private oldArchiveModel: Model<Archivos>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(EventProcedure.name) private eventModel: Model<EventProcedure>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
  ) {}

  async getOldArchives({ limit, offset }: PaginationParamsDto) {
    return await this.oldArchiveModel.find({}).limit(limit).skip(offset);
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

  async archiveMail(
    id_mail: string,
    archiveDto: CreateArchiveDto,
    account: Account,
  ) {
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
      await this.createEvent(procedure._id, archiveDto, account, session);
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

  async archiveProcedure(
    id_procedure: string,
    archiveDto: CreateArchiveDto,
    account: Account,
  ) {
    const { state } = await this.procedureModel.findById(id_procedure);
    if (state !== stateProcedure.INSCRITO)
      throw new BadRequestException('El tramite no puede concluirse');
    const isProcessStarted = await this.communicationModel.findOne({
      procedure: id_procedure,
    });
    if (isProcessStarted)
      throw new BadRequestException(
        'Solo puede archivar tramites que no haya remitido',
      );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        {
          state: stateProcedure.CONCLUIDO,
          endDate: new Date(),
          completionReason: archiveDto.description,
        },
        { session },
      );
      await this.createEvent(id_procedure, archiveDto, account, session);
      await session.commitTransaction();
      return 'Tramite archivado';
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar tramite', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async Unarchive(id_mail: string) {
    const mailArchived = await this.communicationModel.findById(id_mail);
    if (!mailArchived)
      throw new BadRequestException('El tramite ya ha sido desarchivado.');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { procedure } = await this.communicationModel.findByIdAndUpdate(
        id_mail,
        {
          status: statusMail.Received,
        },
        { session },
      );
      await this.procedureModel.findByIdAndUpdate(
        procedure._id,
        {
          state: stateProcedure.EN_REVISION,
          $unset: { endDate: 1, completionReason: 1 },
        },
        { session },
      );
      await session.commitTransaction();
      return 'Tramite desarchivado';
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al archivar tramite', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async createEvent(
    id_procedure: string,
    { description }: CreateArchiveDto,
    account: Account,
    session: mongoose.mongo.ClientSession,
  ) {
    const { funcionario } = await account.populate(
      'funcionario',
      'nombre paterno materno',
    );
    const fullName = createFullName(funcionario);
    const createdEvent = new this.eventModel({
      procedure: id_procedure,
      fullNameOfficer: fullName,
      description,
    });
    await createdEvent.save({ session });
  }
}
