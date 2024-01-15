import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Institution } from '../schemas/institution.schema';
import { FilterQuery, Model } from 'mongoose';
import { CreateInstitutionDto } from '../dto/create-institution.dto';
import { UpdateInstitutionDto } from '../dto/update-institution.dto';

@Injectable()
export class InstitutionService {
  constructor(@InjectModel(Institution.name) private institutionModel: Model<Institution>) {}

  async searchActiveInstitutions(term?: string, limit?: number) {
    const query: FilterQuery<Institution> = { activo: true, ...(term && { nombre: RegExp(term, 'i') }) };
    return await this.institutionModel.find(query).limit(limit ?? 0);
  }

  async get(limit: number, offset: number) {
    offset = offset * limit;
    const [institutions, length] = await Promise.all([
      this.institutionModel.find({}).skip(offset).limit(limit).sort({ _id: -1 }),
      this.institutionModel.count({}),
    ]);
    return { institutions, length };
  }
  async search(limit: number, offset: number, text: string) {
    offset = offset * limit;
    const regex = new RegExp(text, 'i');
    const [institutions, length] = await Promise.all([
      this.institutionModel
        .find({ $or: [{ nombre: regex }, { sigla: regex }] })
        .skip(offset)
        .limit(limit),
      this.institutionModel.count({ $or: [{ nombre: regex }, { sigla: regex }] }),
    ]);
    return { institutions, length };
  }

  async add(institution: CreateInstitutionDto) {
    const duplicate = await this.institutionModel.findOne({ sigla: institution.sigla });
    if (duplicate) throw new BadRequestException('Ya existe una institucion con la sigla introducida');
    const createdInstitucion = new this.institutionModel(institution);
    return await createdInstitucion.save();
  }

  async edit(id_institution: string, institution: UpdateInstitutionDto) {
    const { sigla } = institution;
    const institutionDb = await this.institutionModel.findById(id_institution);
    if (!institutionDb) throw new BadRequestException('La institucion no existe');
    if (institutionDb.sigla !== sigla) {
      const duplicate = await this.institutionModel.findOne({ sigla: institution.sigla });
      if (duplicate) throw new BadRequestException('Ya existe una institucion con la sigla introducida');
    }
    return await this.institutionModel.findByIdAndUpdate(id_institution, institution, { new: true });
  }

  async delete(id_institution: string) {
    const instituciondb = await this.institutionModel.findById(id_institution);
    if (!instituciondb) throw new BadRequestException('La institucion no existe');
    const newInstitucion = await this.institutionModel.findByIdAndUpdate(
      id_institution,
      { activo: !instituciondb.activo },
      { new: true },
    );
    return newInstitucion.activo;
  }
}
