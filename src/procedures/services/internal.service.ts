import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import mongoose, { Model } from 'mongoose';
import { InternalDetail, InternalProcedure, Procedure } from '../schemas';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
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
import { Account } from 'src/modules/administration/schemas';


@Injectable()
export class InternalService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    // @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(InternalProcedure.name)
    private newModel: Model<InternalProcedure>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    procedure: CreateProcedureDto,
    details: CreateInternalDetailDto,
    account: Account,
  ) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      // const createdDetail = new this.internalModel(details);
      // await createdDetail.save({ session });
      const { segment, ...procedureProps } = procedure;
      const code = 'TEST_2';
      const createdProcedure = new this.newModel({
        group: InternalProcedure.name,
        account: account._id,
        code: code,
        ...procedureProps,
        ...details,
      });
      await createdProcedure.save({ session });
      await session.commitTransaction();
      return createdProcedure;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'No se puedo registrar el tramite correctamente',
      );
    } finally {
      session.endSession();
    }
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
      // await this.newModel.updateOne(
      //   {
      //     _id: procedureDB.details._id,
      //   },
      //   details,
      //   { session },
      // );
      const updatedProcedure = await this.newModel
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
      this.newModel
        .find({
          account: id_account,
          // group: groupProcedure.INTERNAL,
          // state: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.newModel.count({
        account: id_account,
        // group: groupProcedure.INTERNAL,
        // state: { $ne: 'ANULADO' },
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
    const data = await this.newModel
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
    const procedureDB = await this.newModel
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
    // const { dependencia } = await account.populate({
    //   path: 'dependencia',
    //   select: 'institucion',
    //   populate: {
    //     path: 'institucion',
    //     select: 'sigla',
    //   },
    // });
    // if (!dependencia) throw new InternalServerErrorException('Error al generar el codigo alterno');
    // const code = `${segmentProcedure}-${dependencia.institucion.sigla}-${this.configService.get('YEAR')}`.toUpperCase();
    // const correlative = await this.procedureModel.count({
    //   group: groupProcedure.INTERNAL,
    //   code: new RegExp(code, 'i'),
    // });
    // return `${code}-${String(correlative + 1).padStart(5, '0')}`;
  }
  private async checkIsEditable(
    id_procedure: string,
  ): Promise<InternalProcedure> {
    const procedureDB = await this.newModel.findById(id_procedure);
    if (!procedureDB)
      throw new BadRequestException('El tramite solicitado no existe');
    if (procedureDB.state !== stateProcedure.INSCRITO)
      throw new BadRequestException(
        'El tramite ya esta en proceso de evaluacion',
      );
    return procedureDB;
  }
}
