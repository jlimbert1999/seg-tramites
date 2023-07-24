import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account } from 'src/administration/schemas';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';
enum StateProcedure {
    INSCRITO = 'INSCRITO',
    EN_REVISION = 'EN REVISION',
    OBSERVADO = 'OBSERVADO',
    CONCLUIDO = 'CONCLUIDO',
    ANULADO = 'ANULADO',
}

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
        required: true,
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
        required: true,
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

@Schema({ collection: 'tramites_externos' })
export class ExternalProcedure extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: TypeProcedure.name
    })
    tipo_tramite: TypeProcedure

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Account.name
    })
    cuenta: Account

    @Prop({
        type: RepresentativeSchema
    })
    representante: Representative

    @Prop({
        type: ApplicantSchema
    })
    solicitante: Applicant

    @Prop({
        type: String,
        enum: Object.values(StateProcedure),
        default: StateProcedure.INSCRITO,
    })
    estado: StateProcedure

    @Prop({
        type: String,
        required: true,
        unique: true
    })
    alterno: string

    @Prop({
        type: Number,
        required: true,
    })
    pin: number

    @Prop({
        type: String,
        required: true
    })
    detalle: string

    @Prop({
        type: String,
        required: true
    })
    cantidad: string

    @Prop({ type: [String], default: [] })
    requerimientos: string[]

    @Prop({ type: Date, default: Date.now })
    fecha_registro: Date

    @Prop({ type: Date })
    fecha_finalizacion: Date

    @Prop({ type: String })
    cite: string
}

export const ExternalProcedureSchema = SchemaFactory.createForClass(ExternalProcedure);