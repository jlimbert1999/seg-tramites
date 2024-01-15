import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Procedure } from './procedure.schema';
import { Account, Officer } from 'src/users/schemas';
@Schema({ _id: false })
export class Participant extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Account.name,
    required: true,
    index: true,
  })
  cuenta: Account;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Officer.name,
  })
  funcionario: Officer;

  @Prop({
    type: String,
    required: true,
  })
  fullname: string;

  @Prop({
    type: String,
  })
  jobtitle?: string;
}
export const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ collection: 'bandeja_entradas' })
export class Inbox extends Document {
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

  //   ** for update
  @Prop({
    type: String,
    required: true,
    enum: ['tramites_externos', 'tramites_internos'],
  })
  tipo: 'tramites_externos' | 'tramites_internos';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tipo',
  })
  tramite: any;

  // @Prop({
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: Procedure.name,
  //   required: true,
  // })
  // tramite: Procedure;

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
    type: Boolean,
  })
  recibido?: boolean;
}

export const InboxSchema = SchemaFactory.createForClass(Inbox);
