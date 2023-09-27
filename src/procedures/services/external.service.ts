import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Account } from 'src/administration/schemas';
import { Procedure } from '../schemas/procedure.schema';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { groupProcedure } from '../interfaces/group.interface';
import { ProcedureService } from './procedure.service';
import {
  CreateExternalDetailDto,
  CreateProcedureDto,
  UpdateExternalDto,
  UpdateProcedureDto,
} from '../dto';
import { Observaciones } from '../schemas/observaciones.schema';

@Injectable()
export class ExternalService {
  constructor(
    @InjectModel(Observaciones.name) private observationModel: Model<Observaciones>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name)
    private externalDetailModel: Model<ExternalDetail>,
    private readonly procedureService: ProcedureService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async search(
    limit: number,
    offset: number,
    id_account: string,
    text: string,
  ) {
    const regex = new RegExp(text, 'i');
    offset = offset * limit;
    const data = await this.procedureModel.aggregate([
      {
        $match: {
          group: groupProcedure.EXTERNAL,
          account: new mongoose.Types.ObjectId(id_account),
          estado: { $ne: 'ANULADO' },
        },
      },
      {
        $lookup: {
          from: 'externaldetails',
          localField: 'details',
          foreignField: '_id',
          as: 'details',
        },
      },
      {
        $unwind: {
          path: '$details',
        },
      },
      {
        $addFields: {
          'details.solicitante.fullname': {
            $concat: [
              '$details.solicitante.nombre',
              ' ',
              { $ifNull: ['$details.solicitante.paterno', ''] },
              ' ',
              { $ifNull: ['$details.solicitante.materno', ''] },
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { 'details.solicitante.fullname': regex },
            { code: regex },
            { reference: regex },
          ],
        },
      },
      {
        $project: {
          'details.solicitante.fullname': 0,
          'details.requerimientos': 0,
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
    const procedures = data[0].paginatedResults;
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { procedures, length };
  }

  async findAll(limit: number, offset: number, id_account: string) {
    offset = offset * limit;
    const [procedures, length] = await Promise.all([
      await this.procedureModel
        .find({
          account: id_account,
          group: groupProcedure.EXTERNAL,
          estado: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('details'),
      await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.EXTERNAL,
        estado: { $ne: 'ANULADO' },
      }),
    ]);
    return { procedures, length };
  }

  async create(
    procedure: CreateProcedureDto,
    details: CreateExternalDetailDto,
    acccount: Account,
  ) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.externalDetailModel(details);
      await createdDetail.save({ session });
      const newProcedure = await this.procedureService.create(
        procedure,
        acccount,
        createdDetail._id,
        groupProcedure.EXTERNAL,
        session,
      );
      await session.commitTransaction();
      return newProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'No se puedo registrar el tramite correctamente',
      );
    } finally {
      session.endSession();
    }
  }

  async update(
    id_procedure: string,
    id_account: string,
    procedure: UpdateProcedureDto,
    details: UpdateExternalDto,
  ) {
    const procedureDB = await this.procedureService.checkIfEditable(
      id_procedure,
      id_account,
    );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.externalDetailModel.updateOne(
        {
          _id: procedureDB.details._id,
        },
        details,
        { session },
      );
      const updatedProcedure = await this.procedureService.update(
        id_procedure,
        procedure,
        session,
      );
      await session.commitTransaction();
      return updatedProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }
}
