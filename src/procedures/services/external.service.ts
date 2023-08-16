import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalProcedure } from '../schemas/external.schema';
import { CreateExternalProcedureDto } from '../dto/create-external.dto';
import { Account, Dependency } from 'src/administration/schemas';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';
import { UpdateExternalProcedureDto } from '../dto/update-external.dto';
import { Observation } from '../schemas/observations.schema';
import { Procedure } from '../schemas/procedure.schema';
import { ExternalDetail } from '../schemas/external-detail.schema';
import { InternalDetail } from '../schemas/internal-detail.schema';
import { groupProcedure } from '../interfaces/group.interface';
import { ProcedureService } from './procedure.service';

@Injectable()
export class ExternalService {
  constructor(
    @InjectModel(ExternalProcedure.name)
    private externalProcedureModel: Model<ExternalProcedure>,
    @InjectModel(TypeProcedure.name)
    private typeProcedure: Model<TypeProcedure>,
    @InjectModel(Observation.name) private observationModel: Model<Observation>,
    @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name)
    private externalDetailModel: Model<ExternalDetail>,
    private readonly procedureService: ProcedureService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) { }
  async markProcedureAsSend(id_procedure: string) {
    return await this.externalProcedureModel.updateOne(
      { _id: id_procedure },
      { enviado: true },
    );
  }

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
        $lookup: {
          from: 'tipos_tramites',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
        },
      },
      {
        $unwind: {
          path: '$type',
        },
      },
      {
        $project: {
          'details.solicitante.fullname': 0,
          'details.requerimientos': 0,
          'type.requerimientos': 0,
          'type.segmento': 0,
          'type.tipo': 0,
          'type.activo': 0,
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
    const [procedures, total] = await Promise.all([
      await this.procedureModel
        .find({
          account: id_account,
          group: 'ExternalDetail',
          estado: { $ne: 'ANULADO' },
        })
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('details'),
      await this.procedureModel.count({
        account: id_account,
        group: 'ExternalDetail',
        estado: { $ne: 'ANULADO' },
      }),
    ]);
    return { procedures, total };
  }

  async create(procedure: CreateExternalProcedureDto, acccount: Account) {
    const { solicitante, representante, pin, requirements, ...values } =
      procedure;
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdDetail = new this.externalDetailModel({
        solicitante,
        representante,
        pin,
        requirements,
      });
      await createdDetail.save({ session });
      const newProcedure = await this.procedureService.create(
        values,
        acccount,
        createdDetail._id,
        groupProcedure.EXTERNAL,
        session,
      );
      await session.commitTransaction();
      return newProcedure;
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new InternalServerErrorException(
        'No se puedo registrar el tramite correctamente',
      );
    } finally {
      session.endSession();
    }
  }


  async update(id_procedure: string, procedure: UpdateExternalProcedureDto) {
    return this.externalProcedureModel
      .findByIdAndUpdate(id_procedure, procedure, { new: true })
      .populate('tipo_tramite');
  }

  async getAllDataProcedure(id_procedure: string) {
    const procedure = await this.externalProcedureModel
      .findById(id_procedure)
      .populate('tipo_tramite', 'nombre')
      .populate({
        path: 'cuenta',
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
    if (!procedure) throw new BadRequestException('El tramite no existe');
    const observations = await this.observationModel.find({
      group: groupProcedure.EXTERNAL,
      procedure: id_procedure,
    });
    return { procedure, observations };
  }

  async generateAlterno(account: Account, id_typeProcedure: string) {
    const dependency = await this.dependencyModel
      .findById(account.dependencia._id)
      .populate('institucion', 'sigla');
    if (!dependency)
      throw new BadRequestException(
        'No se ha podido generar un alterno correctamente',
      );
    if (!dependency.institucion)
      throw new BadRequestException(
        'No se ha podido generar un alterno correctamente',
      );
    const typeProcedure = await this.typeProcedure
      .findById(id_typeProcedure)
      .select('segmento');
    if (!typeProcedure)
      throw new BadRequestException(
        'No se ha podido generar un alterno correctamente',
      );
    // TODO CONFIG YEAR IN ENV
    const regex = new RegExp(
      `${typeProcedure.segmento}-${dependency.institucion.sigla}-2023`.toUpperCase(),
      'i',
    );
    const correlativo = await this.externalProcedureModel.count({
      alterno: regex,
    });
    return `${typeProcedure.segmento}-${dependency.institucion.sigla
      }-2023-${String(correlativo + 1).padStart(6, '0')}`;
  }
}
