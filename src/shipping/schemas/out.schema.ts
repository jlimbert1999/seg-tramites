import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account, Officer } from 'src/administration/schemas';
import { ExternalProcedure } from 'src/procedures/schemas/external.schema';

@Schema({ collection: 'bandeja_salidas' })
export class Out extends Document {
    @Prop({
        type: {
            cuenta: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Account.name,
            },
            funcionario: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Officer.name,
            },
        }
    })
    emisor: {
        cuenta: Account,
        funcionario: Officer
    };
    
    @Prop({
        type: {
            cuenta: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Account.name,
            },
            funcionario: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Officer.name,
            },
        }
    })
    receptor: {
        cuenta: Account,
        funcionario: Officer
    };

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'group',
    })
    // todo add the secod reference internal
    tramite: ExternalProcedure

    @Prop({
        required: true,
        type: String,
        enum: ['tramites_internos', 'tramites_externos'],
    })
    tipo: 'tramites_internos' | 'tramites_externos'

    @Prop({
        type: String,
        required: true
    })
    motivo: string

    @Prop({
        type: String,
        required: true
    })
    cantidad: string

    @Prop({
        type: Date,
        required: true
    })
    fecha_envio: Date

    @Prop({
        type: Date
    })
    fecha_recibido: Date

    @Prop({
        type: Boolean
    })
    recibido: boolean

    @Prop({
        type: String
    })
    motivo_rechazo: string

    @Prop({
        type: String
    })
    numero_interno: string

}

export const OutSchema = SchemaFactory.createForClass(Out);