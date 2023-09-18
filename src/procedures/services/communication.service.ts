import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Outbox, Inbox, Procedure, Communication } from '../schemas';
import { Account } from 'src/administration/schemas';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { CreateCommunicationDto, ReceiverDto } from '../dto';
import { createFullName } from 'src/administration/helpers/fullname';
import { statusMail } from '../interfaces';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Inbox.name) private inboxModel: Model<Inbox>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Procedure.name) private procedureModel: Model<Account>,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async getWorkflowOfProcedure(id_procedure: string) {
    const workflow = await this.outboxModel.aggregate([
      {
        $match: {
          tramite: new mongoose.Types.ObjectId(id_procedure),
        },
      },
      {
        $group: {
          _id: {
            cuenta: '$emisor.cuenta',
            fecha_envio: '$fecha_envio',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          '_id.fecha_envio': 1,
        },
      },
    ]);
    for (const item of workflow) {
      await this.outboxModel.populate(item['sendings'], [
        {
          path: 'emisor.cuenta',
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
          path: 'receptor.cuenta',
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
  async cancelSend(id_outbox: string) {
    const mailDB = await this.outboxModel.findById(id_outbox);
    if (!mailDB)
      throw new BadRequestException('No se encontro el envio realizado');
    if (mailDB.recibido !== undefined)
      throw new BadRequestException(
        'Este envio no se puede cancelar porque el tramite ya ha sido evaluado',
      );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.outboxModel.deleteOne({ _id: id_outbox }, { session });
      await this.inboxModel.findOneAndDelete(
        {
          tramite: mailDB.tramite._id,
          'emisor.cuenta': mailDB.emisor.cuenta._id,
          'receptor.cuenta': mailDB.receptor.cuenta._id,
          fecha_envio: mailDB.fecha_envio,
        },
        { session },
      );
      const recoveredMail = await this.recoverLastMail(
        mailDB.tramite._id,
        mailDB.emisor.cuenta._id,
        true,
        session,
      );

      await session.commitTransaction();
      return recoveredMail;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Ha ocurrido un error al cancelar el envio de un tramite',
      );
    } finally {
      await session.endSession();
    }
  }

  async recoverLastMail(
    id_procedure: string,
    id_receiver: string,
    isRejected: boolean,
    session: mongoose.mongo.ClientSession,
  ) {
    const lastMail = await this.outboxModel
      .findOne({
        tramite: id_procedure,
        'receptor.cuenta': id_receiver,
        recibido: true,
      })
      .sort({ _id: -1 });
    if (!lastMail) {
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        { send: false },
        { session },
      );
      return undefined;
    }
    lastMail.recibido = !isRejected;
    const recoverMail = new this.inboxModel(lastMail);
    return await this.inboxModel.findOneAndUpdate(
      {
        tramite: id_procedure,
        'emisor.cuenta': lastMail.emisor.cuenta._id,
        'receptor.cuenta': lastMail.receptor.cuenta._id,
        recibido: false,
      },
      { $setOnInsert: recoverMail },
      { upsert: true, session: session },
    );
  }
}
