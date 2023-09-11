import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ collection: 'cargos' })
export class Job extends Document {
  @Prop({
    type: String,
    required: true,
    uppercase: true,
  })
  nombre: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'cargos', default: null })
  superior: Job;

  @Prop({ type: Boolean, default: false })
  isRoot: boolean;
}
export const JobSchema = SchemaFactory.createForClass(Job);
