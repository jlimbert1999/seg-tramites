import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Procedure } from './procedure.schema';
import { Participant, ParticipantSchema } from './inbox.schema';
import { statusMail } from '../interfaces/status.interface';

@Schema()
export class Communication extends Document {
  @Prop({
    type: ParticipantSchema,
    required: true,
  })
  emitter: Participant;

  @Prop({
    type: ParticipantSchema,
    required: true,
  })
  receiver: Participant;

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
  reference: string;

  @Prop({
    type: String,
    required: true,
  })
  attachmentQuantity: string;

  @Prop({
    type: String,
  })
  internalNumber: string;

  @Prop({
    type: Date,
    required: true,
  })
  outboundDate: Date;

  @Prop({
    type: Date,
  })
  inboundDate?: Date;

  @Prop({
    type: String,
  })
  rejectionReason?: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(statusMail),
    default: statusMail.Pending,
  })
  status: statusMail;
}

export const CommunicationSchema = SchemaFactory.createForClass(Communication);
