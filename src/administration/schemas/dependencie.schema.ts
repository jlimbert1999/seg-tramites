import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


class Institution {
    @Prop({
        type: String,
        required: true
    })
    nombre: string;

    @Prop({
        type: String,
        required: true
    })
    sigla: string;
}


@Schema({ collection: 'dependencias' })
export class Dependency extends Document {
    @Prop({
        type: String,
        required: true
    })
    nombre: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        uppercase: true
    })
    sigla: string;

    @Prop({
        type: String,
        required: true,
        unique: true
    })
    codigo: string

    @Prop({
        type: Boolean,
        default: true
    })
    activo: boolean

    @Prop({
        _id: false,
        type: Institution,
        default: true
    })
    institucion: {
        nombre: string;
        sigla: string
    }
}

export const DependencySchema = SchemaFactory.createForClass(Dependency);


