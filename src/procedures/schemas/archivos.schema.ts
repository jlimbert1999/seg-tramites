import { Prop } from '@nestjs/mongoose';

const { Schema, model } = require('mongoose');

const ArchivoScheme = Schema({
  location: {
    type: String,
  },
  procedure: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'group',
  },
  group: {
    type: String,
    required: true,
    enum: ['tramites_externos', 'tramites_internos'],
  },
  dependencie: {
    type: Schema.Types.ObjectId,
    ref: 'dependencias',
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'cuentas',
  },
  officer: {
    type: Schema.Types.ObjectId,
    ref: 'funcionarios',
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
ArchivoScheme.method('toJSON', function () {
  const { __v, ...object } = this.toObject();
  return object;
});


@Schema({ collection: 'archivos' })
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
    required: true,uj
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
