import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Role, User } from 'src/modules/users/schemas';
import { Dependency } from './dependencie.schema';
import { Officer } from './officer.schema';


export type AccountDocument = HydratedDocument<Account>;
@Schema()
export class Account extends Document {
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Dependency.name,
  })
  dependencia: Dependency;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Officer.name,
  })
  funcionario?: Officer;

  @Prop({ type: String })
  jobtitle: string;

  @Prop()
  isRoot?: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
  })
  rol: Role;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: User;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
