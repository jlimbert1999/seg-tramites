import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose, { Model } from 'mongoose';
import { InternalDetail, InternalProcedure, Procedure } from '../schemas';

import {
  CreateInternalDetailDto,
  CreateProcedureDto,
  UpdateInternalDetailDto,
  UpdateProcedureDto,
} from '../dto';

import {
  ValidProcedureService,
  stateProcedure,
  groupProcedure,
} from '../interfaces';

import { PaginationDto } from 'src/common';
import { Account } from 'src/modules/administration/schemas';
import {
  CreateInternalProcedureDto,
  UpdateInternalProcedureDto,
} from '../dtos';

@Injectable()
export class InternalService implements ValidProcedureService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(InternalDetail.name)
    private internalDetailModel: Model<InternalDetail>,
    private readonly configService: ConfigService,
    @InjectModel(InternalProcedure.name)
    private internalProcedureModel: Model<InternalProcedure>,
  ) {}

  async create(procedureDto: CreateInternalProcedureDto, account: Account) {
    const { segment, ...props } = procedureDto;
    const code = await this.generateCode(account, segment);
    const createdProcedure = new this.internalProcedureModel({
      account: account._id,
      code: code,
      ...props,
    });
    await createdProcedure.save();
    return createdProcedure;
  }

  async update(id: string, procedureDto: UpdateInternalProcedureDto) {
    const procedureDB = await this.internalProcedureModel.findById(id);
    if (!procedureDB) {
      throw new NotFoundException('El tramite no existe');
    }
    if (procedureDB.state !== stateProcedure.INSCRITO) {
      throw new BadRequestException('El tramite ya esta en curso');
    }
    return await this.internalProcedureModel.findByIdAndUpdate(
      id,
      procedureDto,
      { new: true },
    );
  }

  async findAll({ limit, offset }: PaginationDto, id_account: string) {
    const [procedures, length] = await Promise.all([
      this.internalProcedureModel
        .find({
          account: id_account,
          state: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.internalProcedureModel.count({
        account: id_account,
        state: { $ne: 'ANULADO' },
      }),
    ]);
    return { procedures, length };
  }
  async search(
    { limit, offset }: PaginationDto,
    id_account: string,
    text: string,
  ) {
    const regex = new RegExp(text, 'i');
    const data = await this.procedureModel
      .aggregate()
      .match({
        group: groupProcedure.INTERNAL,
        account: new mongoose.Types.ObjectId(id_account),
        state: { $ne: 'ANULADO' },
      })
      .lookup({
        from: 'internaldetails',
        localField: 'details',
        foreignField: '_id',
        as: 'details',
      })
      .unwind('details')
      .match({
        $or: [
          { code: regex },
          { reference: regex },
          { cite: regex },
          { 'details.destinatario.nombre': regex },
        ],
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
      throw new BadRequestException('El tramite interno solicitado no existe');
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
    const correlative = await this.internalProcedureModel.count({
      code: new RegExp(code, 'i'),
    });
    return `${code}-${String(correlative + 1).padStart(5, '0')}`;
  }

  private async checkIsEditable(id_procedure: string): Promise<Procedure> {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB)
      throw new BadRequestException('El tramite solicitado no existe');
    if (procedureDB.state !== stateProcedure.INSCRITO)
      throw new BadRequestException(
        'El tramite ya esta en proceso de evaluacion',
      );
    return procedureDB;
  }
}
