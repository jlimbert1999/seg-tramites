import { Injectable } from '@nestjs/common';
import { InternalProcedure } from '../schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class InternalService {
    constructor(
        @InjectModel(InternalProcedure.name) private internalProcedureModel: Model<InternalProcedure>,
    ) {
    }

    async findAll(limit: number, offset: number, id_account: string) {
        offset = offset * limit
        const [procedures, length] = await Promise.all([
            await this.internalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite', 'nombre'),
            await this.internalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
        ])
        return { procedures, length }
    }
    async search(limit: number, offset: number, id_account: string, text: string) {
        offset = offset * limit
        const [procedures, length] = await Promise.all([
            await this.internalProcedureModel.find({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
                .sort({ _id: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tipo_tramite', 'nombre'),
            await this.internalProcedureModel.count({ cuenta: id_account, estado: { $ne: 'ANULADO' } })
        ])
        return { procedures, length }
    }
}
