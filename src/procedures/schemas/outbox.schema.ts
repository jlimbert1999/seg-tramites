import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ExternalProcedure } from 'src/procedures/schemas/external.schema';
import { InternalProcedure } from './internal.schema';
import { Procedure } from './procedure.schema';
import { Participant, ParticipantSchema } from './inbox.schema';

@Schema({ collection: 'bandeja_salidas' })
export class Outbox extends Document {
  @Prop({
    type: ParticipantSchema,
    required: true,
  })
  emisor: Participant;

  @Prop({
    type: ParticipantSchema,
    required: true,
  })
  receptor: Participant;

  // @Prop({
  //   type: mongoose.Schema.Types.ObjectId,
  //   refPath: 'group',
  // })
  // tramite: Procedure;
  //   @Prop({
  //     required: true,
  //     type: String,
  //     enum: [ExternalProcedure.name, InternalProcedure.name],
  //   })
  //   tipo: 'ExternalProcedure' | 'InternalProcedure';
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  tramite: Procedure;

  @Prop({
    type: String,
    required: true,
  })
  motivo: string;

  @Prop({
    type: String,
    required: true,
  })
  cantidad: string;

  @Prop({
    type: Date,
    required: true,
  })
  fecha_envio: Date;

  @Prop({
    type: Date,
  })
  fecha_recibido: Date;

  @Prop({
    type: Boolean,
  })
  recibido?: boolean;

  @Prop({
    type: String,
  })
  motivo_rechazo?: string;

  @Prop({
    type: String,
  })
  numero_interno: string;
}

export const OutboxSchema = SchemaFactory.createForClass(Outbox);
