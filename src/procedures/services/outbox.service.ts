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
import { createFullName } from 'src/administration/helpers/fullname';

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

  
}
