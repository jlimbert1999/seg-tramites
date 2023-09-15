import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalProcedure, InternalProcedure, Outbox } from '../schemas';
import { InboxService } from './inbox.service';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    // @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
    private readonly inboxService: InboxService,
    @InjectModel(ExternalProcedure.name)
    private externalProcedure: Model<ExternalProcedure>,
    @InjectModel(InternalProcedure.name)
    private internalProcedure: Model<InternalProcedure>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async getAll(id_account: string, limit: number, offset: number) {
    const dataPaginated = await this.outboxModel.aggregate([
      {
        $match: {
          'emisor.cuenta': id_account,
        },
      },
      {
        $group: {
          _id: {
            cuenta: '$emisor.cuenta',
            tramite: '$tramite',
            fecha_envio: '$fecha_envio',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'procedures',
          localField: '_id.tramite',
          foreignField: '_id',
          as: '_id.tramite',
        },
      },
      {
        $unwind: {
          path: '$_id.tramite',
        },
      },
      { $sort: { '_id.fecha_envio': -1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: offset * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0]
      ? dataPaginated[0].totalCount[0].count
      : 0;
    return { mails, length };
  }

  async getWorkflow(id_procedure: string) {
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

  async cancelOneSend(id_outbox: string) {
    const mailDB = await this.outboxModel.findById(id_outbox);
    if (!mailDB)
      throw new BadRequestException('No se encontro el envio realizado');
    if (mailDB.recibido !== undefined)
      throw new BadRequestException('El tramite ya ha sido evaluado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.outboxModel.deleteOne({ _id: id_outbox }, { session });
      // await this.imboxModel.deleteOne(
      //   {
      //     tramite: mailDB.tramite._id,
      //     'emisor.cuenta': mailDB.emisor.cuenta._id,
      //     'receptor.cuenta': mailDB.receptor.cuenta._id,
      //   },
      //   { session },
      // ),
      //   this.inboxService.recoverLastMail(
      //     mailDB.tramite._id,
      //     mailDB.receptor.cuenta._id,
      //     session,
      //   );
      // await session.commitTransaction();
      // return tramite.state;
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
}
