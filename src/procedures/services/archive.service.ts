import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Communication, ProcedureEvents, Procedure } from '../schemas';
import { EventProcedureDto } from '../dto';
import { stateProcedure, statusMail } from '../interfaces';
import { createFullName } from 'src/administration/helpers/fullname';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/users/schemas';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(ProcedureEvents.name) private procedureEventModel: Model<ProcedureEvents>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
  ) {}

  async archiveProcedure(eventDto: EventProcedureDto, account: Account) {
    const { procedure } = eventDto;
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
      await this.createArchiveEvent(eventDto, account, session);
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
    if (status !== statusMail.Received) throw new BadRequestException(`El tramite ya ha sido desarchivado.`);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.communicationModel.updateOne({ _id: id_mail }, { status: statusMail.Archived }, { session });
      await this.concludeProcedureIfAppropriate(procedure._id, eventDto.stateProcedure, session);
      await this.createArchiveEvent(eventDto, account, session);
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

  async unarchiveMail(id_mail: string, eventDto: EventProcedureDto, account: Account): Promise<{ message: string }> {
    const mailDB = await this.communicationModel.findById(id_mail);
    if (mailDB.status !== statusMail.Archived) throw new BadRequestException('El tramite ya fue desarchivado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      let newStatus = statusMail.Received;
      if (String(mailDB.receiver.cuenta._id) !== String(account._id)) {
        await this.insertPartipantInWokflow(mailDB, account, session);
        newStatus = statusMail.Completed;
      }
      await this.communicationModel.updateOne({ _id: id_mail }, { status: newStatus });
      await this.procedureModel.updateOne(
        { _id: mailDB.procedure._id },
        { state: stateProcedure.EN_REVISION, $unset: { endDate: 1 } },
      );
      await this.createArchiveEvent(eventDto, account, session);
      await session.commitTransaction();
      return { message: 'Tramite desarchivado.' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al desarchivar tramite', {
        cause: error,
      });
    } finally {
      session.endSession();
    }
  }

  async findAll({ limit, offset }: PaginationParamsDto, id_dependency: string) {
    const unit = await this.accountModel
      .find({
        dependencia: id_dependency,
      })
      .select('_id');
    const query: FilterQuery<Communication> = {
      status: statusMail.Archived,
      'receiver.cuenta': { $in: unit.map((acount) => acount._id) },
    };
    const [archives, length] = await Promise.all([
      this.communicationModel
        .find(query)
        .limit(limit)
        .skip(offset)
        .sort({ 'eventLog.date': -1 })
        .populate('procedure')
        .lean(),
      this.communicationModel.count(),
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

  private async createArchiveEvent(
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

  async checkIfProcedureCanBeCompleted(id_procedure: string): Promise<void> {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (procedureDB.state === stateProcedure.CONCLUIDO) {
      throw new BadRequestException(`El tramite ${procedureDB.code} ya fue concluido.`);
    }
    const isProcessStarted = await this.communicationModel.findOne({
      procedure: id_procedure,
    });
    if (isProcessStarted) throw new BadRequestException('Solo puede concluir tramites que no hayan sido remitidos');
  }

  async concludeProcedureIfAppropriate(
    id_procedure: string,
    stateCompleted: stateProcedure.SUSPENDIDO | stateProcedure.CONCLUIDO,
    session: mongoose.mongo.ClientSession,
  ): Promise<void> {
    const isProcessActive = await this.communicationModel.findOne(
      {
        procedure: id_procedure,
        $or: [{ status: statusMail.Pending }, { status: statusMail.Received }],
      },
      undefined,
      { session },
    );
    if (isProcessActive) return;
    await this.procedureModel.updateOne(
      { _id: id_procedure },
      {
        state: stateCompleted,
        endDate: new Date(),
      },
      { session },
    );
  }

  async insertPartipantInWokflow(
    currentMail: Communication,
    participant: Account,
    session: mongoose.mongo.ClientSession,
  ): Promise<void> {
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
