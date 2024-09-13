import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account } from 'src/users/schemas';

export enum PostPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  Low = 'low',
}

@Schema({ _id: false })
class Attachment extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  filename: string;
}
const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema({ timestamps: true })
export class Publication extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Account.name,
    required: true,
  })
  user: Account;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: [AttachmentSchema],
    default: [],
  })
  attachments: Attachment[];

  @Prop({ enum: PostPriority })
  priority: PostPriority;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
