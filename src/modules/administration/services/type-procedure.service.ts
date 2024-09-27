import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeProcedure } from '../schemas/type-procedure.schema';
import { CreateTypeProcedureDto, UpdateTypeProcedureDto } from '../dtos';

@Injectable()
export class TypeProcedureService {
  constructor(@InjectModel(TypeProcedure.name) private typeProcedureModel: Model<TypeProcedure>) {}

  public async getSegments(type?: 'EXTERNO' | 'INTERNO') {
    return await this.typeProcedureModel.find(type ? { tipo: type } : {}).distinct('segmento');
  }

  async search(limit: number, offset: number, text: string) {
    const regex = new RegExp(text, 'i');
    const [types, length] = await Promise.all([
      this.typeProcedureModel.find({ nombre: regex }).lean().skip(offset).limit(limit),
      this.typeProcedureModel.count({ nombre: regex }),
    ]);
    return { types, length };
  }

  async findAll(limit: number, offset: number) {
    const [types, length] = await Promise.all([
      this.typeProcedureModel.find({}).lean().skip(offset).limit(limit).sort({ _id: -1 }),
      this.typeProcedureModel.count({}),
    ]);
    return { types, length };
  }

  async add(typeProcedure: CreateTypeProcedureDto) {
    const createdTypeProcedure = new this.typeProcedureModel(typeProcedure);
    return await createdTypeProcedure.save();
  }

  async edit(id: string, typeProcedure: UpdateTypeProcedureDto) {
    return this.typeProcedureModel.findByIdAndUpdate(id, typeProcedure, { new: true });
  }

  async delete(id: string) {
    const { activo } = await this.typeProcedureModel.findOneAndUpdate(
      { _id: id },
      [{ $set: { activo: { $eq: [false, '$activo'] } } }],
      { new: true },
    );
    return { activo };
  }

  async getEnabledTypesBySegment(segment: string, type?: 'INTERNO' | 'EXTERNO') {
    return await this.typeProcedureModel
      .find({
        segmento: segment.toUpperCase(),
        activo: true,
        ...(type ? { tipo: type } : {}),
      })
      .lean();
  }

  async getEnabledTypesByGroup(group: string) {
    return await this.typeProcedureModel.find({ activo: true, tipo: group }).lean().limit(10);
  }

  async getTypesByText(term: string, type?: string, all = false) {
    return await this.typeProcedureModel
      .find({
        nombre: new RegExp(term, 'i'),
        ...(type ? { tipo: type } : {}),
        ...(!all ? { activo: true } : {}),
      })
      .lean()
      .limit(5);
  }
}
