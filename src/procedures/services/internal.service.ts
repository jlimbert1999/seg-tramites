import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateInternalDetailDto, CreateProcedureDto, UpdateInternalDetailDto, UpdateProcedureDto } from '../dto';
import { groupProcedure } from '../interfaces/group.interface';
import { ProcedureService } from './procedure.service';
import { Account } from 'src/auth/schemas/account.schema';
import { InternalDetail, Procedure } from '../schemas';
import { PaginationParamsDto } from 'src/common/interfaces/pagination_params';

@Injectable()
export class InternalService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(InternalDetail.name) private internalDetailModel: Model<InternalDetail>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly procedureService: ProcedureService,
  ) {}

  async add(procedure: CreateProcedureDto, details: CreateInternalDetailDto, account: Account) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.internalDetailModel(details);
      await createdDetail.save({ session });
      const newProcedure = await this.procedureService.create(
        procedure,
        account,
        createdDetail._id,
        groupProcedure.INTERNAL,
        session,
      );
      await session.commitTransaction();
      return newProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se puedo registrar el tramite correctamente');
    } finally {
      session.endSession();
    }
  }

  async update(
    id_procedure: string,
    id_account: string,
    procedure: UpdateProcedureDto,
    details: UpdateInternalDetailDto,
  ) {
    const procedureDB = await this.procedureService.checkIfEditable(id_procedure, id_account);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.internalDetailModel.updateOne(
        {
          _id: procedureDB.details._id,
        },
        details,
        { session },
      );
      const updatedProcedure = await this.procedureService.update(id_procedure, procedure, session);
      await session.commitTransaction();
      return updatedProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  async findAll({ limit, offset }: PaginationParamsDto, id_account: string) {
    offset = offset * limit;
    const [procedures, length] = await Promise.all([
      await this.procedureModel
        .find({
          account: id_account,
          group: groupProcedure.INTERNAL,
          state: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('details'),
      await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.INTERNAL,
        state: { $ne: 'ANULADO' },
      }),
    ]);
    return { procedures, length };
  }

  async search({ limit, offset }: PaginationParamsDto, id_account: string, text: string) {
    const regex = new RegExp(text, 'i');
    offset = offset * limit;
    const data = await this.procedureModel.aggregate([
      {
        $match: {
          group: groupProcedure.INTERNAL,
          account: new mongoose.Types.ObjectId(id_account),
          estado: { $ne: 'ANULADO' },
        },
      },
      {
        $lookup: {
          from: 'internaldetails',
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
        $match: {
          $or: [{ code: regex }, { reference: regex }, { cite: regex }, { 'details.destinatario.nombre': regex }],
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
}
