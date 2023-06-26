import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

class Requirements {
    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    nombre: string;

    @Prop({
        type: Boolean,
        default: true
    })
    activo: boolean;
}

@Schema({ collection: 'tipos_tramites' })
export class TypeProcedure extends Document {
    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    nombre: string;

    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    segmento: string;

    @Prop({
        type: String,
        required: true,
        enum: ['EXTERNO', 'INTERNO']
    })
    tipo: string;

    @Prop({
        type: Boolean,
        default: true
    })
    activo: boolean;

    @Prop({ _id: false, type: mongoose.Types.Array })
    privileges: Requirements[]

}
export const TypeProcedureSchema = SchemaFactory.createForClass(TypeProcedure);


