import { Get, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dependency } from '../schemas/dependencie.schema';
import { Model } from 'mongoose';

@Injectable()
export class DependencieService {
    constructor(
        @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>
    ) {

    }

    @Get()
    async findAll(limit: number, offset: number) {
        offset = offset * limit
        const [dependencies, length] = await Promise.all(
            [
                this.dependencyModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.dependencyModel.count({})
            ]
        )
        return { dependencies, length }
    }
    async getFiltered(limit: number, offset: number, text?: string, institution?: string) {
        offset = offset * limit
        const query = {}
        if (text) query['$or'] = [{ nombre: new RegExp(text) }, { sigla: new RegExp(text) }]
        if (institution) query['institucion'] = institution
        const [dependencies, length] = await Promise.all(
            [
                this.dependencyModel.find(query)
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.dependencyModel.count(query)
            ]
        )
        return { dependencies, length }
    }

}
