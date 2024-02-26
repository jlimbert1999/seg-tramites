import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Account } from 'src/users/schemas';

@Schema()
export class Post extends Document {
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
    type: [String],
    default: [],
  })
  files: string[];

  @Prop({ type: Date, default: Date.now })
  publicationDate: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
