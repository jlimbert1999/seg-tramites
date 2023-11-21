import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeProcedure } from '../schemas/type-procedure.schema';
import { CreateTypeProcedureDto } from '../dto/create-typeProcedure.dto';
import { UpdateTypeProcedureDto } from '../dto/update-typeProcedure.dto';

@Injectable()
export class TypeProcedureService {
  constructor(@InjectModel(TypeProcedure.name) private typeProcedureModel: Model<TypeProcedure>) {}
  async getSegmentsOfTypesProcedures(type: string) {
    return await this.typeProcedureModel.aggregate([
      {
        $match: {
          activo: true,
          tipo: type,
        },
      },
      {
        $group: {
          _id: '$segmento',
        },
      },
      {
        $project: {
          segmento: 1,
        },
      },
    ]);
  }
  async search(limit: number, offset: number, text: string) {
    offset = offset * limit;
    const regex = new RegExp(text, 'i');
    const [typesProcedures, length] = await Promise.all([
      this.typeProcedureModel.find({ nombre: regex }).skip(offset).limit(limit),
      this.typeProcedureModel.count({ nombre: regex }),
    ]);
    return { typesProcedures, length };
  }
  async get(limit: number, offset: number) {
    offset = offset * limit;
    const [typesProcedures, length] = await Promise.all([
      this.typeProcedureModel.find({}).skip(offset).limit(limit).sort({ _id: -1 }),
      this.typeProcedureModel.count({}),
    ]);
    return { typesProcedures, length };
  }
  async add(typeProcedure: CreateTypeProcedureDto) {
    const createdTypeProcedure = new this.typeProcedureModel(typeProcedure);
    return await createdTypeProcedure.save();
  }
  async edit(id_typeProcedure: string, typeProcedure: UpdateTypeProcedureDto) {
    return this.typeProcedureModel.findByIdAndUpdate(id_typeProcedure, typeProcedure, { new: true });
  }
  async delete(id_typeProcedure: string) {
    const typeProcedureDB = await this.typeProcedureModel.findById(id_typeProcedure);
    if (!typeProcedureDB) throw new BadRequestException('El tipo de tramite no existe');
    return this.typeProcedureModel.findByIdAndUpdate(
      id_typeProcedure,
      { activo: !typeProcedureDB.activo },
      { new: true },
    );
  }

  async getTypeProceduresBySegments(segment: string) {
    return await this.typeProcedureModel.find({ segmento: segment.toUpperCase(), activo: true });
  }

  async getTypesProceduresByGroup(group: 'INTERNO' | 'EXTERNO') {
    return await this.typeProcedureModel.find({ activo: true, tipo: group });
  }

  async getTypesProceduresByText(text: string) {
    return await this.typeProcedureModel
      .find({ nombre: new RegExp(text, 'i') })
      .limit(5)
      .select('nombre');
  }
}
