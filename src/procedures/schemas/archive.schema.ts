import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account } from 'src/administration/schemas';
import { Procedure } from './procedure.schema';
import { Participant, ParticipantSchema } from './inbox.schema';
import { groupArchive } from '../interfaces';

@Schema()
export class Archive extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Procedure.name,
    required: true,
  })
  procedure: Procedure;

  @Prop({
    type: ParticipantSchema,
    required: true,
  })
  manager: Participant;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(groupArchive),
    required: true,
  })
  group: groupArchive;

  @Prop({
    type: Date,
    default: Date.now,
  })
  date: Date;
}
export const ArchiveSchema = SchemaFactory.createForClass(Archive);
