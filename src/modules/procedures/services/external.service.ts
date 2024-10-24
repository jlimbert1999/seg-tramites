import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection, FilterQuery, Model, Types } from 'mongoose';
import {
  ExternalDetail,
  ExternalProcedure,
  Procedure,
  ProcedureBase,
} from '../schemas';

import {
  CreateExternalDetailDto,
  CreateProcedureDto,
  UpdateExternalDto,
  UpdateProcedureDto,
} from '../dto';

import {
  ValidProcedureService,
  groupProcedure,
  stateProcedure,
} from '../interfaces';
import { PaginationDto } from 'src/common';
import { Account } from 'src/modules/administration/schemas';
import {
  CreateExternalProcedureDto,
  UpdateExternalProcedureDto,
} from '../dtos';

@Injectable()
export class ExternalService implements ValidProcedureService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name)
    private externalDetailModel: Model<ExternalDetail>,
    private configService: ConfigService,
    @InjectModel(ExternalProcedure.name)
    private externaProcedurelModel: Model<ExternalProcedure>,
  ) {}

  async search(
    { limit, offset }: PaginationDto,
    id_account: string,
    text: string,
  ) {
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
        $or: [
          { 'details.solicitante.fullname': regex },
          { code: regex },
          { reference: regex },
        ],
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

  async findAll({ limit, offset, term }: PaginationDto, accountId: string) {
    const regex = new RegExp(term, 'i');
    const query: FilterQuery<ExternalProcedure> = {
      account: accountId,
      ...(term && { $or: [{ code: regex, reference: regex }] }),
    };
    const [procedures, length] = await Promise.all([
      this.externaProcedurelModel
        .find(query)
        .populate('account')
        .sort({ _id: -1 })
        .limit(limit)
        .skip(offset),
      this.externaProcedurelModel.count(query),
    ]);
    return { procedures, length };
  }

  async create(procedureDto: CreateExternalProcedureDto, account: Account) {
    const { segment, ...props } = procedureDto;
    const code = await this.generateCode(account, segment);
    const createdProcedure = new this.externaProcedurelModel({
      account: account._id,
      code: code,
      pin: Math.floor(100000 + Math.random() * 900000),
      ...props,
    });
    return await createdProcedure.save();
  }

  async update(id: string, procedureDto: UpdateExternalProcedureDto) {
    const procedureDB = await this.externaProcedurelModel.findById(id);
    if (!procedureDB) {
      throw new NotFoundException('El tramite no existe');
    }
    if (procedureDB.state !== stateProcedure.INSCRITO) {
      throw new BadRequestException('El tramite ya esta en curso');
    }
    return await this.externaProcedurelModel.findByIdAndUpdate(
      id,
      procedureDto,
      { new: true },
    );
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
    if (!procedureDB)
      throw new NotFoundException(`El tramite ${id} no existe.`);
    return procedureDB;
  }

  private async checkIsEditable(
    procedureId: string,
  ): Promise<ExternalProcedure> {
    const procedureDB = await this.externaProcedurelModel.findById(procedureId);
    if (!procedureDB) {
      throw new NotFoundException('El tramite no existe');
    }
    if (procedureDB.state !== stateProcedure.INSCRITO) {
      throw new BadRequestException(
        'El tramite ya esta en proceso de evaluacion',
      );
    }
    return procedureDB;
  }

  private async generateCode(
    account: Account,
    segment: string,
  ): Promise<string> {
    const { dependencia } = await account.populate({
      path: 'dependencia.institucion',
    });
    const code = `${segment}-${
      dependencia.institucion.sigla
    }-${this.configService.get('YEAR')}`.toUpperCase();
    const correlative = await this.externaProcedurelModel.count({
      code: new RegExp(code),
    });
    return `${code}-${String(correlative + 1).padStart(6, '0')}`;
  }
}