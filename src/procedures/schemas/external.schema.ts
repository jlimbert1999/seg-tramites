import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';


class Applicant {
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
        enum: ['JURIDICO', 'NATURAL']
    })
    tipo: string;
}


@Schema({ collection: 'cuentas' })
export class Account extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: TypeProcedure.name
    })
    tipo_tramite: TypeProcedure

    // @Prop({
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: Role.name
    // })
    // rol: Role

    // @Prop({
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: Officer.name
    // })
    // funcionario: Officer

    @Prop({
        type: String,
        required: true,
        unique: true
    })
    login: string;

    @Prop({
        type: String,
        required: true
    })
    password: string;

    @Prop({
        type: Boolean,
        default: true
    })
    activo: boolean
}

export const AccountSchema = SchemaFactory.createForClass(Account);