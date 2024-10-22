import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
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
    type: String,
    required: true,
    unique: true,
  })
  dni: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Job.name,
  })
  cargo?: Job;

  @Prop({
    type: Boolean,
    default: true,
  })
  activo: boolean;

  @Virtual({
    get: function (this: Officer) {
      return `${this.nombre} ${this.paterno} ${this.materno}`;
    },
  })
  fullName: string;
}

export const OfficerSchema = SchemaFactory.createForClass(Officer);
