import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { TypeProcedure } from '../schemas/type-procedure.schema';
import { PaginationDto } from 'src/common';
import { CreateTypeProcedureDto, UpdateTypeProcedureDto } from '../dtos';

@Injectable()
export class TypeProcedureService {
  constructor(
    @InjectModel(TypeProcedure.name)
    private typeProcedureModel: Model<TypeProcedure>,
  ) {}

  async findAll({ limit, offset, term }: PaginationDto) {
    const query: FilterQuery<TypeProcedure> = {
      ...(term && { nombre: new RegExp(term, 'i') }),
    };
    const [types, length] = await Promise.all([
      this.typeProcedureModel
        .find(query)
        .lean()
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 }),
      this.typeProcedureModel.count(query),
    ]);
    return { types, length };
  }

  async create(typeProcedure: CreateTypeProcedureDto) {
    const createdTypeProcedure = new this.typeProcedureModel(typeProcedure);
    return await createdTypeProcedure.save();
  }

  async update(id: string, typeProcedure: UpdateTypeProcedureDto) {
    return this.typeProcedureModel.findByIdAndUpdate(id, typeProcedure, {
      new: true,
    });
  }

  async getEnabledTypesBySegment(
    segment: string,
    type?: 'INTERNO' | 'EXTERNO',
  ) {
    return await this.typeProcedureModel
      .find({
        segmento: segment.toUpperCase(),
        activo: true,
        ...(type ? { tipo: type } : {}),
      })
      .lean();
  }

  async getEnabledTypesByGroup(group: string) {
    return await this.typeProcedureModel
      .find({ activo: true, tipo: group })
      .lean()
      .limit(10);
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

  public async getSegments(type?: 'EXTERNO' | 'INTERNO'): Promise<string[]> {
    return await this.typeProcedureModel
      .find(type ? { tipo: type } : {})
      .distinct('segmento');
  }
}
