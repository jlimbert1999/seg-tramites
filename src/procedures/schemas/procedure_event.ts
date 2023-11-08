import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Procedure } from './procedure.schema';

@Schema()
export class ProcedureEvents extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Procedure.name,
    required: true,
  })
  procedure: Procedure;

  @Prop({
    type: String,
    required: true,
  })
  fullNameOfficer: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  date: Date;
}
export const ProcedureEventSchema = SchemaFactory.createForClass(ProcedureEvents);
