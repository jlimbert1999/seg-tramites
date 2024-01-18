import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Institution } from './institution.schema';

@Schema({ collection: 'dependencias' })
export class Dependency extends Document {
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
  sigla: string;

  @Prop({
    type: String,
  })
  codigo: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  activo: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Institution.name,
  })
  institucion: Institution;
}

export const DependencySchema = SchemaFactory.createForClass(Dependency);
