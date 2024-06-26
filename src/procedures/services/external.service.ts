import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection, Model, Types } from 'mongoose';
import { ExternalDetail, Procedure } from '../schemas';

import { CreateExternalDetailDto, CreateProcedureDto, UpdateExternalDto, UpdateProcedureDto } from '../dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

import { ValidProcedureService, groupProcedure, stateProcedure } from '../interfaces';
import { Account } from 'src/users/schemas';

@Injectable()
export class ExternalService implements ValidProcedureService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalDetailModel: Model<ExternalDetail>,
    private configService: ConfigService,
  ) {}

  async search({ limit, offset }: PaginationParamsDto, id_account: string, text: string) {
    const regex = new RegExp(text, 'i');
    const data = await this.procedureModel
      .aggregate()
      .match({
        group: groupProcedure.EXTERNAL,
        account: new Types.ObjectId(id_account),
        state: { $ne: stateProcedure.ANULADO },
      })
      .lookup({
        from: 'externaldetails',
        localField: 'details',
        foreignField: '_id',
        as: 'details',
      })
      .unwind('$details')
      .addFields({
        'details.solicitante.fullname': {
          $concat: [
            '$details.solicitante.nombre',
            ' ',
            { $ifNull: ['$details.solicitante.paterno', ''] },
            ' ',
            { $ifNull: ['$details.solicitante.materno', ''] },
          ],
        },
      })
      .match({
        $or: [{ 'details.solicitante.fullname': regex }, { code: regex }, { reference: regex }],
      })
      .project({
        'details.solicitante.fullname': 0,
        'details.requerimientos': 0,
      })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
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
        .limit(limit)
        .skip(offset)
        .populate('details'),
      await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.EXTERNAL,
        state: { $ne: stateProcedure.ANULADO },
      }),
    ]);
    return { procedures, length };
  }

  async create({ segment, ...procedureProps }: CreateProcedureDto, details: CreateExternalDetailDto, account: Account) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.externalDetailModel(details);
      const { _id } = await createdDetail.save({ session });
      const code = await this.generateCode(account, segment);
      const createdProcedure = new this.procedureModel({
        group: groupProcedure.EXTERNAL,
        account: account._id,
        code: code,
        details: _id,
        ...procedureProps,
      });
      await createdProcedure.save({ session });
      await createdProcedure.populate('details');
      await session.commitTransaction();
      return createdProcedure;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al registrar el tramite externo');
    } finally {
      session.endSession();
    }
  }
  async update(id: string, procedure: UpdateProcedureDto, details: UpdateExternalDto) {
    const procedureDB = await this.checkIsEditable(id);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.externalDetailModel.updateOne({ _id: procedureDB.details._id }, details, { session });
      const updatedProcedure = await this.procedureModel
        .findByIdAndUpdate(id, procedure, {
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

  async getDetail(id: string) {
    const procedureDB = await this.procedureModel
      .findById(id)
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
    if (!procedureDB) throw new NotFoundException(`El tramite ${id} no existe.`);
    return procedureDB;
  }

  private async checkIsEditable(id_procedure: string): Promise<Procedure> {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new NotFoundException('El tramite solicitado no existe');
    if (procedureDB.state !== stateProcedure.INSCRITO) {
      throw new BadRequestException('El tramite ya esta en proceso de evaluacion');
    }
    return procedureDB;
  }

  private async generateCode(account: Account, segment: string): Promise<string> {
    const { dependencia } = await account.populate({
      path: 'dependencia',
      select: 'institucion',
      populate: {
        path: 'institucion',
        select: 'sigla',
      },
    });
    if (!dependencia) throw new InternalServerErrorException('Error al generar el codigo alterno');
    const code = `${segment}-${dependencia.institucion.sigla}-${this.configService.get('YEAR')}`.toUpperCase();
    const correlative = await this.procedureModel.count({ group: groupProcedure.EXTERNAL, code: new RegExp(code) });
    return `${code}-${String(correlative + 1).padStart(6, '0')}`;
  }
}
