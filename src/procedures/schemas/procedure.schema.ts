import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account } from 'src/administration/schemas';
import { TypeProcedure } from 'src/administration/schemas/type-procedure.schema';
import { ExternalDetail } from './external-detail.schema';
import { InternalDetail } from './internal-detail.schema';
import { stateProcedure } from '../interfaces/states-procedure.interface';

@Schema()
export class Procedure extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  })
  code: string;

  @Prop({ type: String, default: '' })
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

  @Prop({ type: Date, default: Date.now })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({
    type: String,
    required: true,
    enum: [ExternalDetail.name, InternalDetail.name],
  })
  group: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'group',
  })
  details: ExternalDetail | InternalDetail;

  @Prop({
    type: String,
  })
  tramite: string;
}

export const ProcedureSchema = SchemaFactory.createForClass(Procedure);
