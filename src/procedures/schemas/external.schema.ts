import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';




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