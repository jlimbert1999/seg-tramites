import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Officer } from './officer.schema';
import { Job } from './job.schema';

@Schema()
export class JobChanges extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Officer.name,
    required: true,
  })
  officer: Officer;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Job.name,
    required: true,
  })
  job: Job;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}
export const JobChangesSchema = SchemaFactory.createForClass(JobChanges);
