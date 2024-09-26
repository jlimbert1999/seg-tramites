import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateOfficerDto, UpdateOfficerDto } from '../dtos';
import { JobChanges, Officer } from '../schemas';

@Injectable()
export class OfficerService {
  constructor(
    @InjectModel(Officer.name) private officerModel: Model<Officer>,
    @InjectModel(JobChanges.name) private jobChangesModel: Model<JobChanges>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  public async createOfficerForAccount(
    officer: CreateOfficerDto,
    session: mongoose.mongo.ClientSession,
  ): Promise<Officer> {
    await this.verifyDuplicateDni(officer.dni);
    const createdOfficer = new this.officerModel(officer);
    const officerDB = await createdOfficer.save({ session });
    if (officerDB.cargo) await this.createLogRotation(officerDB._id, officerDB.cargo._id, session);
    return officerDB;
  }

  public async findOfficersForProcess(text: string, limit = 7) {
    const regex = new RegExp(text, 'i');
    return await this.officerModel
      .aggregate()
      .match({ activo: true })
      .addFields({
        fullname: {
          $concat: ['$nombre', ' ', { $ifNull: ['$paterno', ''] }, ' ', { $ifNull: ['$materno', ''] }],
        },
      })
      .match({ fullname: regex })
      .limit(limit)
      .project({ fullname: 0 })
      .lookup({
        from: 'cargos',
        localField: 'cargo',
        foreignField: '_id',
        as: 'cargo',
      })
      .unwind({
        path: '$cargo',
        preserveNullAndEmptyArrays: true,
      });
  }

  async search(limit: number, offset: number, text: string) {
    const regex = new RegExp(text, 'i');
    const dataPaginated = await this.officerModel
      .aggregate()
      .lookup({
        from: 'cargos',
        localField: 'cargo',
        foreignField: '_id',
        as: 'cargo',
      })
      .unwind({
        path: '$cargo',
        preserveNullAndEmptyArrays: true,
      })
      .addFields({
        fullname: {
          $concat: ['$nombre', ' ', { $ifNull: ['$paterno', ''] }, ' ', { $ifNull: ['$materno', ''] }],
        },
      })
      .match({ $or: [{ fullname: regex }, { dni: regex }, { 'cargo.nombre': regex }] })
      .sort({ _id: -1 })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const officers = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0;
    return { officers, length };
  }

  async get(limit: number, offset: number) {
    const [officers, length] = await Promise.all([
      this.officerModel.find({}).lean().sort({ _id: -1 }).skip(offset).limit(limit).populate('cargo', 'nombre'),
      this.officerModel.count(),
    ]);
    return { officers, length };
  }

  async create(officer: CreateOfficerDto) {
    await this.verifyDuplicateDni(officer.dni);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const createdOfficer = new this.officerModel(officer);
      const officerDB = await createdOfficer.save({ session });
      if (officerDB.cargo) await this.createLogRotation(officerDB._id, officerDB.cargo._id, session);
      await session.commitTransaction();
      await this.officerModel.populate(officerDB, 'cargo');
      return officerDB;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al crear funcionario');
    } finally {
      session.endSession();
    }
  }

  async edit(id_officer: string, data: UpdateOfficerDto) {
    const officerDB = await this.officerModel.findById(id_officer);
    if (!officerDB) throw new NotFoundException(`El funcionario ${id_officer} no existe`);
    // if (data.dni && data.dni !== officerDB.dni) await this.verifyDuplicateDni(data.dni);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const currentJob = officerDB.cargo ? String(officerDB.cargo._id) : undefined;
      if (data.cargo !== currentJob) {
        await this.createLogRotation(id_officer, data.cargo, session);
      }
      const updatedOfficer = await this.officerModel
        .findByIdAndUpdate(id_officer, data, { new: true, session })
        .populate('cargo');
      await session.commitTransaction();
      return updatedOfficer;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al editar funcionario');
    } finally {
      session.endSession();
    }
  }

  async unlinkOfficerJob(id_officer: string) {
    const queryResult = await this.officerModel.updateOne({ _id: id_officer }, { $unset: { cargo: 1 } });
    if (queryResult.modifiedCount === 0) throw new BadRequestException('El cargo del funcionario ya ha sido removido');
    return { message: 'El cargo del funcionario se ha removido' };
  }

  async changeOfficerStatus(id_officer: string) {
    const { activo } = await this.officerModel.findOneAndUpdate({ _id: id_officer }, [
      { $set: { activo: { $eq: [false, '$activo'] } } },
    ]);
    return { activo: !activo };
  }

  async getOfficerWorkHistory(id_officer: string, offset: number) {
    return await this.jobChangesModel
      .find({ officer: id_officer })
      .lean()
      .limit(5)
      .skip(offset)
      .sort({ date: -1 })
      .populate('job', 'nombre');
  }

  async searchOfficersWithoutAccount(text: string, limit = 7) {
    const regex = new RegExp(text, 'i');
    const officers = await this.officerModel
      .aggregate()
      .addFields({
        fullname: {
          $concat: ['$nombre', ' ', '$paterno', ' ', { $ifNull: ['$materno', ''] }],
        },
      })
      .match({ fullname: regex, activo: true })
      .lookup({
        from: 'cuentas',
        localField: '_id',
        foreignField: 'funcionario',
        as: 'cuenta',
      })
      .match({ cuenta: { $size: 0 } })
      .project({ cuenta: 0, fullname: 0 })
      .limit(limit);
    return await this.officerModel.populate(officers, { path: 'cargo' });
  }

  private async verifyDuplicateDni(dni: string): Promise<void> {
    const officer = await this.officerModel.findOne({ dni });
    if (officer) throw new BadRequestException('El dni introducido ya existe');
  }

  private async createLogRotation(
    id_officer: string,
    id_job: string,
    session: mongoose.mongo.ClientSession,
  ): Promise<void> {
    const createdEvent = new this.jobChangesModel({ officer: id_officer, job: id_job });
    await createdEvent.save({ session });
  }
}
