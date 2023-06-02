import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Dependency } from './dependencie.schema';
import { Role } from './role.schema';
import { Officer } from './officer.schema';



@Schema({ collection: 'cuentas' })
export class Account extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Dependency.name
    })
    dependencie: Dependency | string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Role.name
    })
    rol: Role
    
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Officer.name
    })
    officer: Officer | string

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
    active: boolean
}

export const AccountSchema = SchemaFactory.createForClass(Account);