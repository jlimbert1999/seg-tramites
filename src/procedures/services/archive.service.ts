import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Archivos } from '../schemas/archivos.schema';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { Archive, Communication, Procedure } from '../schemas';
import { CreateArchiveDto } from '../dto';
import { stateProcedure, statusMail } from '../interfaces';
import { Account } from 'src/administration/schemas';
import { createFullName } from 'src/administration/helpers/fullname';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Archivos.name) private oldArchiveModel: Model<Archivos>,
    @InjectModel(Archive.name) private archiveModel: Model<Archive>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
  ) {}

  async getOldArchives({ limit, offset }: PaginationParamsDto) {
    return await this.oldArchiveModel.find({}).limit(limit).skip(offset);
  }

  async archiveMail(
    id_mail: string,
    createArchiveDto: CreateArchiveDto,
    account: Account,
  ) {
    const { procedure } = createArchiveDto;
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
        procedure,
        $or: [{ status: statusMail.Pending }, { status: statusMail.Received }],
      });
      if (!isProcessActive) {
        await this.procedureModel.updateOne(
          { procedure },
          { state: stateProcedure.CONCLUIDO, endDate: new Date() },
          { session },
        );
      }
      await this.createArchive(account, createArchiveDto, session);
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

  async archiveProcedure(createArchiveDto: CreateArchiveDto, account: Account) {
    const { procedure } = createArchiveDto;
    const isProcessStarted = await this.communicationModel.findOne({
      procedure,
    });
    if (isProcessStarted)
      throw new BadRequestException(
        'Solo puede archivar tramites que no haya remitido',
      );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.procedureModel.updateOne(
        { _id: procedure },
        { state: stateProcedure.CONCLUIDO, endDate: new Date() },
        { session },
      );
      await this.createArchive(account, createArchiveDto, session);
      await session.commitTransaction();
      return 'Tramite archivado';
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

  async createArchive(
    account: Account,
    archive: CreateArchiveDto,
    session: mongoose.mongo.ClientSession,
  ) {
    const { _id, funcionario } = await this.accountModel.populate(account, {
      path: 'funcionario',
      select: 'nombre paterno materno cargo',
      populate: {
        path: 'cargo',
        select: 'nombre',
      },
    });
    const manager = {
      cuenta: _id,
      fullname: createFullName(funcionario),
      ...(funcionario.cargo && { jobtitle: funcionario.cargo.nombre }),
    };
    const createdArchived = new this.archiveModel({ ...archive, manager });
    await createdArchived.save({ session });
  }

}
