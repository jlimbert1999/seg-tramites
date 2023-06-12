import { Get, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Dependency } from '../schemas/dependencie.schema';
import { Model } from 'mongoose';

@Injectable()
export class DependencieService {
    constructor(@InjectModel(Dependency.name) private dependencyModel: Model<Dependency>) {

    }

    @Get()
    async update() {
        const dependencies = await this.dependencyModel.find({}).populate('institucion')
        for (const dependency of dependencies) {
            console.log(dependency)
        }
    }
}
