import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeProcedure } from '../schemas/type-procedure.schema';

@Injectable()
export class TypeProcedureService {
    constructor(@InjectModel(TypeProcedure.name) private typeProcedureModel: Model<TypeProcedure>,) {

    }

    async get(limit: number, offset: number) {
        offset = offset * limit
        const [typesProcedures, length] = await Promise.all(
            [
                this.typeProcedureModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.typeProcedureModel.count({})
            ]
        )
        return { typesProcedures, length }
    }
    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [roles, length] = await Promise.all(
            [
                this.typeProcedureModel.find({ nombre: regex })
                    .skip(offset)
                    .limit(limit),
                this.typeProcedureModel.count({ nombre: regex })
            ]
        )
        return { roles, length }
    }
}
