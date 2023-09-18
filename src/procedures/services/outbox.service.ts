import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Communication } from '../schemas';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { statusMail } from '../interfaces';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findAll(id_account: string, { limit, offset }: PaginationParamsDto) {
    const dataPaginated = await this.communicationModel.aggregate([
      {
        $match: {
          'emitter.cuenta': id_account,
        },
      },
      {
        $group: {
          _id: {
            account: '$emitter.cuenta',
            procedure: '$procedure',
            outboundDate: '$outboundDate',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'procedures',
          localField: '_id.procedure',
          foreignField: '_id',
          as: '_id.procedure',
        },
      },
      {
        $unwind: {
          path: '$_id.procedure',
        },
      },
      { $sort: { '_id.outboundDate': -1 } },
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
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0]
      ? dataPaginated[0].totalCount[0].count
      : 0;
    return { mails, length };
  }

  async getWorkflowProcedure(id_procedure: string) {
    const workflow = await this.communicationModel.aggregate([
      {
        $match: {
          procedure: new mongoose.Types.ObjectId(id_procedure),
        },
      },
      {
        $group: {
          _id: {
            cuenta: '$emitter.cuenta',
            outboundDate: '$outboundDate',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          '_id.outboundDate': 1,
        },
      },
    ]);
    for (const item of workflow) {
      await this.communicationModel.populate(item['sendings'], [
        {
          path: 'emitter.cuenta',
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
          path: 'receiver.cuenta',
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

  async cancelSend(outboxIds: string[]) {
    const mails = await this.communicationModel.find({
      _id: {
        $in: outboxIds,
      },
    });
    // console.log(object);
    // if (!mailDB)
    //   throw new BadRequestException('No se encontro el envio realizado');
    // if (mailDB.status === statusMail.Received)
    //   throw new BadRequestException('El tramite ya ha sido evaluado');
    // const session = await this.connection.startSession();
    // try {
    //   session.startTransaction();
    //   await this.communicationModel.deleteOne({ _id: id_outbox }, { session });

    //   await this.outboxModel.deleteOne({ _id: id_outbox }, { session });
    //   await this.imboxModel.deleteOne(
    //     {
    //       tramite: mailDB.tramite._id,
    //       'emisor.cuenta': mailDB.emisor.cuenta._id,
    //       'receptor.cuenta': mailDB.receptor.cuenta._id,
    //     },
    //     { session },
    //   ),
    //     this.inboxService.recoverLastMail(
    //       mailDB.tramite._id,
    //       mailDB.receptor.cuenta._id,
    //       session,
    //     );
    //   await session.commitTransaction();
    //   return tramite.state;
    // } catch (error) {
    //   console.log(error);
    //   await session.abortTransaction();
    //   throw new InternalServerErrorException(
    //     'Ha ocurrido un error al aceptar el tramite',
    //   );
    // } finally {
    //   await session.endSession();
    // }
  }
}
