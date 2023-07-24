import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExternalProcedure } from '../schemas/external.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExternalService {
    constructor(@InjectModel(ExternalProcedure.name) private externalProcedureModel: Model<ExternalProcedure>) {

    }

    async findAll(limit: number, offset: number, id_account: string) {
        const [procedures, total] = await Promise.all([
            await this.externalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite'),
            await this.externalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
        ])
        return { procedures, total }
    }

}
