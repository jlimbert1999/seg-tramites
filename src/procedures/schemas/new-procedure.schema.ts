import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { TypeProcedure } from 'src/administration/schemas';
import { Account } from 'src/users/schemas';
import { stateProcedure } from '../interfaces';
import { ExternalProcedure } from './external-procedure.schema';
import { InternalProcedure } from './internal-procedure.schema';

@Schema({ discriminatorKey: 'group', timestamps: true })
export class ProcedureBase {
  @Prop({
    type: String,
    required: true,
  })
  code: string;

  @Prop({ type: String, default: 'S/C' })
  cite: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TypeProcedure.name,
  })
  type: TypeProcedure;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Account.name,
  })
  account: Account;

  @Prop({
    type: String,
    enum: Object.values(stateProcedure),
    default: stateProcedure.INSCRITO,
  })
  state: stateProcedure;

  @Prop({
    type: String,
    required: true,
  })
  reference: string;

  @Prop({
    type: String,
    required: true,
  })
  amount: string;

  @Prop({ type: Boolean, default: false })
  send: boolean;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({
    type: String,
    required: true,
    enum: [ExternalProcedure.name, InternalProcedure.name],
  })
  group: string;
}
export const ProcedureBaseSchema = SchemaFactory.createForClass(ProcedureBase);
ProcedureBaseSchema.index({ code: 1, group: 1 }, { unique: true });