import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Officer } from '../../users/schemas';
import mongoose, { Model } from 'mongoose';
import { CreateOfficerDto } from '../dtos/create-officer.dto';
import { UpdateOfficerDto } from '../dtos/update-officer.dto';
import { Job } from '../schemas/job.schema';
import { JobChanges } from '../schemas/jobChanges.schema';

@Injectable()
export class OfficerService {
  constructor(
    @InjectModel(Officer.name) private officerModel: Model<Officer>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(JobChanges.name) private jobChangesModel: Model<JobChanges>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

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
      this.officerModel.find({}).sort({ _id: -1 }).skip(offset).limit(limit).populate('cargo', 'nombre'),
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
      if (officerDB.cargo._id) await this.createLogRotation(officerDB._id, officerDB.cargo._id, session);
      await session.commitTransaction();
      return officerDB;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al crear funcionario');
    } finally {
      session.endSession();
    }
  }

  public async createOfficerForAccount(
    officer: CreateOfficerDto,
    session: mongoose.mongo.ClientSession,
  ): Promise<Officer> {
    await this.verifyDuplicateDni(officer.dni);
    const createdOfficer = new this.officerModel(officer);
    const officerDB = await createdOfficer.save({ session });
    if (officerDB.cargo._id) await this.createLogRotation(officerDB._id, officerDB.cargo._id, session);
    return officerDB;
  }

  async edit(id_officer: string, officer: UpdateOfficerDto) {
    // const { dni } = officer;
    // if (!officerDB.cargo && officer.cargo) {
    //   const createdEvent = new this.jobChangesModel({ officer: officerDB._id, job: officer.cargo });
    //   await createdEvent.save();
    // } else if (officerDB.cargo && !officer.cargo) {
    //   await this.officerModel.findByIdAndUpdate(officerDB._id, { $unset: { cargo: 1 } });
    // } else if (officerDB.cargo._id != officer.cargo) {
    //   const createdEvent = new this.jobChangesModel({ officer: officerDB._id, job: officer.cargo });
    //   await createdEvent.save();
    // }
    // return await this.officerModel.findByIdAndUpdate(id_officer, officer, { new: true }).populate('cargo');
  }
  async delete(id_officer: string) {
    const officerDB = await this.officerModel.findById(id_officer);
    if (!officerDB) throw new BadRequestException('El funcionario no existe');
    return await this.officerModel.findByIdAndUpdate(id_officer, { activo: !officerDB.activo }, { new: true });
  }

  async getOfficerWorkHistory(id_officer: string, limit: number, offset: number) {
    return await this.jobChangesModel
      .find({ officer: id_officer })
      .skip(offset)
      .limit(limit)
      .sort({ date: -1 })
      .populate('job', 'nombre')
      .populate('officer', 'nombre paterno materno');
  }
  async findOfficersWithoutAccount(text: string) {
    const regex = new RegExp(text, 'i');
    const officers = await this.officerModel.aggregate([
      {
        $addFields: {
          fullname: {
            $concat: ['$nombre', ' ', '$paterno', ' ', { $ifNull: ['$materno', ''] }],
          },
        },
      },
      {
        $match: {
          cuenta: false,
          activo: true,
          $or: [{ fullname: regex }, { dni: regex }],
        },
      },
      { $limit: 5 },
    ]);
    return await this.officerModel.populate(officers, { path: 'cargo' });
  }

  async findOfficerForProcess(text: string) {
    const regex = new RegExp(text, 'i');
    return await this.officerModel.aggregate([
      {
        $match: {
          activo: true,
        },
      },
      {
        $lookup: {
          from: 'cargos',
          localField: 'cargo',
          foreignField: '_id',
          as: 'cargo',
        },
      },
      {
        $unwind: {
          path: '$cargo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          fullname: {
            $concat: ['$nombre', ' ', { $ifNull: ['$paterno', ''] }, ' ', { $ifNull: ['$materno', ''] }],
          },
        },
      },
      {
        $match: {
          $or: [{ fullname: regex }, { 'cargo.nombre': regex }],
        },
      },
      { $limit: 5 },
    ]);
  }

  private async markOfficerWithAccount(id_officer: string, hasAccount: boolean) {
    return await this.officerModel.findByIdAndUpdate(id_officer, { cuenta: hasAccount });
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
