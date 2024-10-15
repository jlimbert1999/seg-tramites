import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class Applicant extends Document {
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
        type: String,
        uppercase: true
    })
    telefono: string;

    @Prop({
        type: String,
        uppercase: true
    })
    dni: string;

    @Prop({
        type: String,
        enum: ['JURIDICO', 'NATURAL'],
        required: true,
    })
    tipo: string;

    @Prop({
        type: String
    })
    documento: string;
}

@Schema({ _id: false })
class Representative extends Document {
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
    paterno: string;

    @Prop({
        type: String,
        uppercase: true
    })
    materno: string;

    @Prop({
        type: String,
        uppercase: true
    })
    telefono: string;

    @Prop({
        type: String,
        uppercase: true,
        required: true,
    })
    dni: string;

    @Prop({
        type: String
    })
    documento: string;

}
const ApplicantSchema = SchemaFactory.createForClass(Applicant);
const RepresentativeSchema = SchemaFactory.createForClass(Representative);

@Schema()
export class ExternalDetail extends Document {
    @Prop({
        type: RepresentativeSchema
    })
    representante: Representative

    @Prop({
        type: ApplicantSchema
    })
    solicitante: Applicant

    @Prop({ type: [String], default: [] })
    requirements: string[]

    @Prop({
        type: Number,
        required: true,
    })
    pin: number
}

export const ExternalDetailSchema = SchemaFactory.createForClass(ExternalDetail);