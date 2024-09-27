import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dependency } from '../schemas/dependencie.schema';
import { CreateDependencyDto, UpdateDependencyDto } from '../dtos';

@Injectable()
export class DependencieService {
  constructor(@InjectModel(Dependency.name) private dependencyModel: Model<Dependency>) {}

  async findAll(limit: number, offset: number) {
    const [dependencies, length] = await Promise.all([
      this.dependencyModel.find({}).lean().populate('institucion').skip(offset).limit(limit).sort({ _id: -1 }),
      this.dependencyModel.count({}),
    ]);
    return { dependencies, length };
  }

  async search(limit: number, offset: number, text: string) {
    const regex = new RegExp(text, 'i');
    const [dependencies, length] = await Promise.all([
      this.dependencyModel
        .find({ $or: [{ nombre: regex }, { sigla: regex }] })
        .lean()
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 })
        .populate('institucion'),
      this.dependencyModel.count({ $or: [{ nombre: regex }, { sigla: regex }] }),
    ]);
    return { dependencies, length };
  }

  async add(dependency: CreateDependencyDto) {
    const createdDependency = new this.dependencyModel(dependency);
    return (await createdDependency.save()).populate('institucion');
  }

  async edit(id: string, dependency: UpdateDependencyDto) {
    return await this.dependencyModel.findByIdAndUpdate(id, dependency, { new: true }).populate('institucion');
  }

  async delete(id: string) {
    const { activo } = await this.dependencyModel.findOneAndUpdate(
      { _id: id },
      [{ $set: { activo: { $eq: [false, '$activo'] } } }],
      { new: true },
    );
    return { activo };
  }

  async getActiveDependenciesOfInstitution(id_institution: string, text?: string, limit?: number) {
    return await this.dependencyModel
      .find({
        institucion: id_institution,
        activo: true,
        ...(text && { nombre: RegExp(text, 'i') }),
      })
      .limit(limit ?? 0)
      .lean();
  }
}
