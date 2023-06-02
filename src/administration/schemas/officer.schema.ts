import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'funcionarios' })
export class Officer extends Document {
    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    firstName: string;

    @Prop({
        type: String,
        uppercase: true
    })
    middleName: string;

    @Prop({
        type: String,
        uppercase: true
    })
    lastName: string;

    @Prop({
        type: Number,
        required: true,
    })
    telephone: number

    @Prop({
        type: Number,
        required: true,
        unique: true
    })
    dni: number

    @Prop({
        type: String
    })
    addres: string

    @Prop({
        type: String,
        required: true,
        uppercase: true
    })
    jobtitle: string

    @Prop({
        type: Boolean,
        default: true
    })
    active: boolean

    @Prop({
        type: Boolean,
        default: false
    })
    hasAccount: boolean
}

export const OfficerSchema = SchemaFactory.createForClass(Officer);


