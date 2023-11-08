import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Officer } from 'src/administration/schemas';
import { ExternalProcedure } from './external.schema';
import { InternalProcedure } from './internal.schema';

@Schema({ collection: 'eventos' })
export class Eventos {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'group',
  })
  procedure: ExternalProcedure | InternalProcedure;

  @Prop({
    type: String,
    enum: ['tramites_externos', 'tramites_internos'],
  })
  group: 'tramites_externos' | 'tramites_internos';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Officer.name,
    required: true,
  })
  officer: Officer;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: Date,
    default: Date.now,
    required: true,
  })
  date: Date;
}

export const EventosSchema = SchemaFactory.createForClass(Eventos);
