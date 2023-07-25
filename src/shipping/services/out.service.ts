import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Out } from '../schemas/out.schema';
import { Model } from 'mongoose';

@Injectable()
export class OutService {
    constructor(
        @InjectModel(Out.name) private outModel: Model<Out>,
    ) {

    }
    async getWorkflowProcedure(id_procedure: string) {
        return await this.outModel.find({ tramite: id_procedure }).select('-_id -__v')
            .populate({
                path: 'emisor.cuenta',
                select: '_id',
                populate: {
                    path: 'dependencia',
                    select: 'nombre',
                    populate: {
                        path: 'institucion',
                        select: 'sigla'
                    }
                }
            })
            .populate({
                path: 'emisor.funcionario',
                select: '-_id nombre paterno materno cargo',
            })
            .populate({
                path: 'receptor.cuenta',
                select: '_id',
                populate: {
                    path: 'dependencia',
                    select: 'nombre',
                    populate: {
                        path: 'institucion',
                        select: 'sigla'
                    }
                }
            })
            .populate({
                path: 'receptor.funcionario',
                select: '-_id nombre paterno materno cargo',
            })
    }
}
