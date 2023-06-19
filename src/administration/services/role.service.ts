import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../schemas';
import { Model } from 'mongoose';

@Injectable()
export class RoleService {

    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>
    ) {
    }


    async get(limit: number, offset: number) {
        offset = offset * limit
        const [roles, length] = await Promise.all(
            [
                this.roleModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.roleModel.count({})
            ]
        )
        return { roles, length }
    }
    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [roles, length] = await Promise.all(
            [
                this.roleModel.find({ role: regex })
                    .skip(offset)
                    .limit(limit),
                this.roleModel.count({ role: regex })
            ]
        )
        return { roles, length }
    }

    // async add(institution: CreateInstitutionDto) {
    //     const duplicate = await this.institutionModel.findOne({ sigla: institution.sigla })
    //     if (duplicate) throw new BadRequestException('Ya existe una institucion con la sigla introducida')
    //     const createdInstitucion = new this.institutionModel(institution)
    //     return await createdInstitucion.save()
    // };

    // async edit(id_institution: string, institution: UpdateInstitutionDto) {
    //     const { sigla } = institution
    //     const institutionDb = await this.institutionModel.findById(id_institution)
    //     if (!institutionDb) throw new BadRequestException('La institucion no existe')
    //     if (institutionDb.sigla !== sigla) {
    //         const duplicate = await this.institutionModel.findOne({ sigla: institution.sigla })
    //         if (duplicate) throw new BadRequestException('Ya existe una institucion con la sigla introducida')
    //     }
    //     return await this.institutionModel.findByIdAndUpdate(id_institution, institution, { new: true })
    // };

    // async delete(id_institution: string) {
    //     const instituciondb = await this.institutionModel.findById(id_institution)
    //     if (!instituciondb) throw new BadRequestException('La institucion no existe')
    //     const newInstitucion = await this.institutionModel.findByIdAndUpdate(id_institution, { activo: !instituciondb.activo }, { new: true })
    //     return newInstitucion.activo
    // };

}
