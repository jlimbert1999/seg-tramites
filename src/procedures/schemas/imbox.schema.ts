import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account, Officer } from 'src/administration/schemas';
import { ExternalProcedure } from './external.schema';

@Schema({ _id: false })
export class Participant extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Account.name,
        required: true
    })
    cuenta: Account

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Officer.name,
    })
    funcionario: Officer

    @Prop({
        type: String,
        required: true
    })
    fullname: string

    @Prop({
        type: String
    })
    jobtitle: string
}
export const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ collection: 'bandeja_entradas' })
export class Imbox extends Document {
    @Prop({
        type: ParticipantSchema,
        required: true
    })
    emisor: Participant

    @Prop({
        type: ParticipantSchema,
        required: true
    })
    receptor: Participant

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
        required: true,
    })
    fecha_envio: Date

    @Prop({
        type: Boolean
    })
    recibido: boolean

}

export const ImboxSchema = SchemaFactory.createForClass(Imbox);