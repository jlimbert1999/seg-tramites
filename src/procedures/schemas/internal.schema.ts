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


@Schema({ collection: 'tramites_internos' })
export class InternalProcedure extends Document {
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
        type: PersonSchema,
        required: true
    })
    remitente: Person

    @Prop({
        type: PersonSchema,
        required: true
    })
    destinatario: Person

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
        type: String,
        required: true
    })
    detalle: string

    @Prop({
        type: String,
        required: true
    })
    cantidad: string

    @Prop({ type: Date, default: Date.now })
    fecha_registro: Date

    @Prop({ type: Date })
    fecha_finalizacion: Date

    @Prop({ type: String, default: '' })
    cite: string

    @Prop({ type: Boolean, default: false })
    enviado: boolean
}

export const InternalProcedureSchema = SchemaFactory.createForClass(InternalProcedure);