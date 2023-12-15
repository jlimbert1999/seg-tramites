import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateExternalDetailDto, CreateProcedureDto, UpdateExternalDto, UpdateProcedureDto } from '../dto';
import { ValidProcedureService, groupProcedure, stateProcedure } from '../interfaces';
import { ExternalDetail, Procedure } from '../schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/auth/schemas/account.schema';
import { ProcedureService } from './procedure.service';

@Injectable()
export class ExternalService implements ValidProcedureService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalDetailModel: Model<ExternalDetail>,
    private procedureService: ProcedureService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async search({ limit, offset }: PaginationParamsDto, id_account: string, text: string) {
    const regex = new RegExp(text, 'i');
    const data = await this.procedureModel.aggregate([
      {
        $match: {
          group: groupProcedure.EXTERNAL,
          account: new mongoose.Types.ObjectId(id_account),
          state: { $ne: stateProcedure.ANULADO },
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
          $or: [{ 'details.solicitante.fullname': regex }, { code: regex }, { reference: regex }],
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
  async findAll({ limit, offset }: PaginationParamsDto, id_account: string) {
    const [procedures, length] = await Promise.all([
      await this.procedureModel
        .find({
          account: id_account,
          group: groupProcedure.EXTERNAL,
          state: { $ne: stateProcedure.ANULADO },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('details'),
      await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.EXTERNAL,
        state: { $ne: stateProcedure.ANULADO },
      }),
    ]);
    return { procedures, length };
  }

  async create(procedure: CreateProcedureDto, details: CreateExternalDetailDto, account: Account) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.externalDetailModel(details);
      const { _id } = await createdDetail.save({ session });
      const createdProcedure = await this.procedureService.create(
        {
          group: groupProcedure.EXTERNAL,
          id_detail: _id,
          dto: procedure,
          account,
        },
        session,
      );
      await session.commitTransaction();
      return createdProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al registrar el tramite externo');
    } finally {
      session.endSession();
    }
  }
  async update(id_procedure: string, procedure: UpdateProcedureDto, details: UpdateExternalDto) {
    const procedureDB = await this.checkIfProcedureIsEditable(id_procedure);
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
      const updatedProcedure = await this.procedureModel
        .findByIdAndUpdate(id_procedure, procedure, {
          session,
          new: true,
        })
        .populate('details');
      await session.commitTransaction();
      return updatedProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }
  async getProcedureDetail(id_procedure: string) {
    const procedureDB = await this.procedureModel
      .findById(id_procedure)
      .populate('details')
      .populate('type', 'nombre')
      .populate({
        path: 'account',
        select: '_id',
        populate: {
          path: 'funcionario',
          select: 'nombre paterno materno cargo',
          populate: {
            path: 'cargo',
            select: 'nombre',
          },
        },
      });
    if (!procedureDB) throw new BadRequestException('El tramite solicitado no existe');
    return procedureDB;
  }
  async checkIfProcedureIsEditable(id_procedure: string) {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new BadRequestException('El tramite solicitado no existe');
    if (procedureDB.state !== stateProcedure.INSCRITO)
      throw new BadRequestException('El tramite ya esta en proceso de evaluacion');
    return procedureDB;
  }
}
