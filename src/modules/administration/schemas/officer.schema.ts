import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Job } from './job.schema';

@Schema({ collection: 'funcionarios' })
export class Officer extends Document {
  @Prop({
    type: String,
    required: true,
    uppercase: true,
  })
  nombre: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  paterno: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  materno: string;

  @Prop({
    type: Number,
    required: true,
  })
  telefono: number;

  @Prop({
    type: Number,
    required: true,
    unique: true,
  })
  dni: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Job.name,
  })
  cargo?: Job;

  @Prop({
    type: String,
  })
  //   ! DELETE AFTER UPDATE
  oldcargo: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  activo: boolean;

  @Prop({
    type: Boolean,
    // default: false,
  })
  cuenta: boolean;

  @Prop({
    type: String,
  })
  imgUrl?: string;
}

export const OfficerSchema = SchemaFactory.createForClass(Officer);
