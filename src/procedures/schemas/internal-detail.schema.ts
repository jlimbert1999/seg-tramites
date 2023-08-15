import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class Person extends Document {
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
    cargo: string;
}
const PersonSchema = SchemaFactory.createForClass(Person);


@Schema()
export class InternalDetail extends Document {

    @Prop({
        type: PersonSchema,
        required: true
    })
    remitente: Person

    @Prop({
        type: PersonSchema,
        required: true
    })
    destinatario: Person
}

export const InternalDetailSchema = SchemaFactory.createForClass(InternalDetail);