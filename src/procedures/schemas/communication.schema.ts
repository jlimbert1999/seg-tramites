import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Procedure } from './procedure.schema';
import { statusMail } from '../interfaces/status.interface';
import { Account, Officer } from 'src/users/schemas';

@Schema({ _id: false })
class Participant extends Document {
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
const ParticipantSchema = SchemaFactory.createForClass(Participant);

@Schema({ _id: false })
class EventLog extends Document {
  @Prop({ type: String, required: true })
  manager: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true })
  date: Date;
}
const EventLogSchema = SchemaFactory.createForClass(EventLog);

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

  @Prop({
    type: EventLogSchema,
  })
  eventLog: EventLog;
}

export const CommunicationSchema = SchemaFactory.createForClass(Communication);
