import { BadRequestException, Get, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dependency } from '../schemas/dependencie.schema';
import { Model } from 'mongoose';
import { CreateDependencyDto } from '../dto/create-dependency.dto';
import { UpdateDependencyDto } from '../dto/update-dependency.dto';

@Injectable()
export class DependencieService {
    constructor(
        @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>
    ) {
    }

    @Get()
    async get(limit: number, offset: number) {
        offset = offset * limit
        const [dependencies, length] = await Promise.all(
            [
                this.dependencyModel.find({})
                    .populate('institucion')
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.dependencyModel.count({})
            ]
        )
        return { dependencies, length }
    }
    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [dependencies, length] = await Promise.all(
            [
                this.dependencyModel.find({ $or: [{ nombre: regex }, { sigla: regex }] })
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 })
                    .populate('institucion'),
                this.dependencyModel.count({ $or: [{ nombre: regex }, { sigla: regex }] })
            ]
        )
        return { dependencies, length }
    }

    async add(dependency: CreateDependencyDto) {
        const duplicate = await this.dependencyModel.findOne({ $or: [{ sigla: dependency.sigla }, { codigo: dependency.codigo }] })
        if (duplicate) throw new BadRequestException('La sigla y codigo de la dependencia deben ser unicos')
        const createdDependency = new this.dependencyModel(dependency)
        return (await createdDependency.save()).populate('institucion')
    };

    async edit(id_dependency: string, dependency: UpdateDependencyDto) {
        const { sigla, codigo } = dependency
        const dependencyDb = await this.dependencyModel.findById(id_dependency)
        if (!dependencyDb) throw new BadRequestException('La dependencia no existe')
        if (dependencyDb.sigla !== sigla || dependencyDb.codigo !== codigo) {
            const duplicate = await this.dependencyModel.findOne({ $or: [{ sigla: dependency.sigla }, { codigo: dependency.codigo }] })
            if (duplicate) throw new BadRequestException('La sigla y codigo de la dependencia deben ser unicos')
        }
        return await this.dependencyModel.findByIdAndUpdate(id_dependency, dependency, { new: true }).populate('institucion')
    };

    async delete(id_dependency: string) {
        const dependencyDb = await this.dependencyModel.findById(id_dependency)
        if (!dependencyDb) throw new BadRequestException('La dependencia no existe')
        const newDependency = await this.dependencyModel.findByIdAndUpdate(id_dependency, { activo: !dependencyDb.activo }, { new: true })
        return newDependency.activo
    };

}
