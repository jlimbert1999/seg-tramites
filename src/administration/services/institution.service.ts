import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Institution } from '../schemas/institution.schema';
import { CreateInstitutionDto, UpdateInstitutionDto } from '../dto';

@Injectable()
export class InstitutionService {
  constructor(@InjectModel(Institution.name) private institutionModel: Model<Institution>) {}

  public async searchActiveInstitutions(term?: string, limit?: number) {
    const query: FilterQuery<Institution> = { activo: true, ...(term && { nombre: RegExp(term, 'i') }) };
    return await this.institutionModel.find(query).limit(limit ?? 0);
  }

  async get(limit: number, offset: number) {
    const [institutions, length] = await Promise.all([
      this.institutionModel.find({}).lean().skip(offset).limit(limit).sort({ _id: -1 }),
      this.institutionModel.count({}),
    ]);
    return { institutions, length };
  }

  async search(limit: number, offset: number, text: string) {
    const regex = new RegExp(text, 'i');
    const [institutions, length] = await Promise.all([
      this.institutionModel
        .find({ $or: [{ nombre: regex }, { sigla: regex }] })
        .lean()
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
    const institutionDB = await this.institutionModel.findById(id_institution);
    if (!institutionDB) throw new BadRequestException('La institucion no existe');
    if (institutionDB.sigla !== sigla) {
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
