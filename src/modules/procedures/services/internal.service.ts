import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class InternalService implements ValidProcedureService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(InternalDetail.name)
    private internalDetailModel: Model<InternalDetail>,
    private readonly configService: ConfigService,
    @InjectModel(InternalProcedure.name)
    private internalModel: Model<InternalProcedure>,
  ) {}

  async create(
    procedure: CreateProcedureDto,
    details: CreateInternalDetailDto,
    account: Account,
  ) {
    // const session = await this.connection.startSession();
    // try {
    //   session.startTransaction();
    //   const createdDetail = new this.internalDetailModel(details);
    //   await createdDetail.save({ session });
    //   const { segment, ...procedureProps } = procedure;
    //   const code = await this.generateCode(account, segment);
    //   const createdProcedure = new this.procedureModel({
    //     group: groupProcedure.INTERNAL,
    //     details: createdDetail._id,
    //     account: account._id,
    //     code: code,
    //     ...procedureProps,
    //   });
    //   await createdProcedure.save({ session });
    //   await createdProcedure.populate('details');
    //   await session.commitTransaction();
    //   return createdProcedure;
    // } catch (error) {
    //   await session.abortTransaction();
    //   throw new InternalServerErrorException(
    //     'No se puedo registrar el tramite correctamente',
    //   );
    // } finally {
    //   session.endSession();
    // }
    const { segment, ...procedureProps } = procedure;
    const code = await this.generateCode(account, segment);
    const createdProcedure = new this.internalModel({
      account: account._id,
      code: code,
      ...procedureProps,
      ...details,
    });
    await createdProcedure.save();
    return createdProcedure;
  }

  async update(
    id: string,
    procedure: UpdateProcedureDto,
    details: UpdateInternalDetailDto,
  ) {
    const procedureDB = await this.checkIsEditable(id);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.internalModel.updateOne(
        {
          _id: procedureDB.details._id,
        },
        details,
        { session },
      );
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

  async findAll({ limit, offset }: PaginationDto, id_account: string) {
    const [procedures, length] = await Promise.all([
      this.internalModel
        .find({
          account: id_account,
          state: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.internalModel.count({
        account: id_account,
        state: { $ne: 'ANULADO' },
      }),
    ]);
    console.log(procedures);
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
  private async generateCode(account: Account, segmentProcedure: string) {
    const { dependencia } = await account.populate({
      path: 'dependencia',
      select: 'institucion',
      populate: {
        path: 'institucion',
        select: 'sigla',
      },
    });
    if (!dependencia)
      throw new InternalServerErrorException(
        'Error al generar el codigo alterno',
      );
    const code = `${segmentProcedure}-${
      dependencia.institucion.sigla
    }-${this.configService.get('YEAR')}`.toUpperCase();
    const correlative = await this.internalModel.count({
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
