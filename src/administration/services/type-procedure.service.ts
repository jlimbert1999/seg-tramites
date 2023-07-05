import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TypeProcedure } from '../schemas/type-procedure.schema';
import { CreateTypeProcedureDto } from '../dto/create-typeProcedure.dto';
import { UpdateTypeProcedureDto } from '../dto/update-typeProcedure.dto';

@Injectable()
export class TypeProcedureService {
    constructor(@InjectModel(TypeProcedure.name) private typeProcedureModel: Model<TypeProcedure>,) {

    }
    async getSegmentsOfTypesProcedures() {
        return await this.typeProcedureModel.aggregate([
            {
                $group: {
                    _id: "$segmento"
                }
            },
            {
                $project: {
                    'segmento': 1
                }
            }
        ])
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
        // update in mongodb db.tipos_tramites.updateMany({}, {$rename:{'requerimientos':'oldrequerimientos'}})
        // const typeProcedure = await this.typeProcedureModel.find({})
        // for (const type of typeProcedure) {
        //     let requeriments = []
        //     if (type.tipo === 'EXTERNO') {
        //         requeriments = type.oldrequerimientos.map(el => el.nombre)
        //         await this.typeProcedureModel.findByIdAndUpdate(type._id, { requerimientos: requeriments })

        //     }
        //     else {
        //         await this.typeProcedureModel.findByIdAndUpdate(type._id, { requerimientos: [] })
        //     }
        // }
        return { typesProcedures, length }
    }
    async add(typeProcedure: CreateTypeProcedureDto) {
        const createdTypeProcedure = new this.typeProcedureModel(typeProcedure)
        return await createdTypeProcedure.save()
    }
    async edit(id_typeProcedure: string, typeProcedure: UpdateTypeProcedureDto) {
        return this.typeProcedureModel.findByIdAndUpdate(id_typeProcedure, typeProcedure, { new: true })
    }

}
