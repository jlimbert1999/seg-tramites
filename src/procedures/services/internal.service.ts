import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose, { Model } from 'mongoose';
import { CreateInternalDetailDto, CreateProcedureDto, UpdateInternalDetailDto, UpdateProcedureDto } from '../dto';
import { groupProcedure } from '../interfaces/group.interface';
import { Account } from 'src/auth/schemas/account.schema';
import { InternalDetail, Procedure } from '../schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { ValidProcedureService, stateProcedure } from '../interfaces';

@Injectable()
export class InternalService implements ValidProcedureService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(InternalDetail.name) private internalDetailModel: Model<InternalDetail>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(procedure: CreateProcedureDto, details: CreateInternalDetailDto, account: Account) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.internalDetailModel(details);
      await createdDetail.save({ session });
      const { segment, ...procedureProperties } = procedure;
      const code = await this.generateInternalCode(account, segment);
      const createdProcedure = new this.procedureModel({
        code,
        group: groupProcedure.INTERNAL,
        account: account._id,
        details: createdDetail._id,
        ...procedureProperties,
      });
      await createdProcedure.save({ session });
      await createdProcedure.populate('details');
      await session.commitTransaction();
      return createdProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se puedo registrar el tramite correctamente');
    } finally {
      session.endSession();
    }
  }
  async update(id_procedure: string, procedure: UpdateProcedureDto, details: UpdateInternalDetailDto) {
    const procedureDB = await this.checkIfProcedureIsEditable(id_procedure);
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
  async findAll({ limit, offset }: PaginationParamsDto, id_account: string) {
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
    if (!procedureDB) throw new BadRequestException('El tramite interno solicitado no existe');
    return procedureDB;
  }
  async generateInternalCode(account: Account, segmentProcedure: string) {
    const { dependencia } = await account.populate({
      path: 'dependencia',
      select: 'institucion',
      populate: {
        path: 'institucion',
        select: 'sigla',
      },
    });
    if (!dependencia) throw new InternalServerErrorException('Error al generar el codigo alterno');
    const code = `${segmentProcedure}-${dependencia.institucion.sigla}-${this.configService.get('YEAR')}`.toUpperCase();
    const correlative = await this.procedureModel.count({
      group: groupProcedure.INTERNAL,
      code: new RegExp(code, 'i'),
    });
    return `${code}-${String(correlative + 1).padStart(5, '0')}`;
  }
  async checkIfProcedureIsEditable(id_procedure: string) {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new BadRequestException('El tramite solicitado no existe');
    if (procedureDB.state !== stateProcedure.INSCRITO)
      throw new BadRequestException('El tramite ya esta en proceso de evaluacion');
    return procedureDB;
  }
}
