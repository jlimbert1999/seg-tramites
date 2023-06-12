import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'funcionarios' })
export class Officer extends Document {
    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    nombre: string;

    @Prop({
        type: String,
        uppercase: true
    })
    paterno: string;

    @Prop({
        type: String,
        uppercase: true
    })
    materno: string;

    @Prop({
        type: Number,
        required: true,
    })
    telefono: number

    @Prop({
        type: Number,
        required: true,
        unique: true
    })
    dni: number

    @Prop({
        type: String
    })
    direccion: string

    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    cargo: string

    @Prop({
        type: Boolean,
        default: true
    })
    activo: boolean

    @Prop({
        type: Boolean,
        default: false
    })
    cuenta: boolean
}

export const OfficerSchema = SchemaFactory.createForClass(Officer);


