import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Dependency } from 'src/administration/schemas';
import { Officer } from './officer.schema';
import { Role } from './role.schema';

@Schema({ collection: 'cuentas' })
export class Account extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Dependency.name,
  })
  dependencia: Dependency;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
  })
  rol: Role;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Officer.name,
  })
  funcionario?: Officer;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  login: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  activo: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  isVisible: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  updatedPassword: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
