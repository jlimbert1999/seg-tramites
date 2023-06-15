import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Institution } from '../schemas/institution.schema';
import { Model } from 'mongoose';

@Injectable()
export class InstitutionService {
    constructor(
        @InjectModel(Institution.name) private institutionModel: Model<Institution>
    ) {
    }

    async findAll(limit: number, offset: number) {
        offset = offset * limit
        const [institutions, length] = await Promise.all(
            [
                this.institutionModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.institutionModel.count({})
            ]
        )
        return { institutions, length }
    }
    async findByText(limit: number, offset: number) {
        offset = offset * limit
        const [institutions, length] = await Promise.all(
            [
                this.institutionModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.institutionModel.count({})
            ]
        )
        return { institutions, length }
    }
}
