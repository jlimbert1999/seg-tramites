import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/modules/users/schemas';

export enum PublicationPriority {
  HIGH = 2,
  MEDIUM = 1,
  Low = 0,
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
    ref: User.name,
    required: true,
  })
  user: User;

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

  @Prop({ enum: PublicationPriority })
  priority: PublicationPriority;

  @Prop({ type: Date })
  expirationDate: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
