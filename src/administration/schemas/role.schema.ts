import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';

class Permissions {
  @Prop({
    type: String,
    enum: Object.values(validResources),
  })
  resource: string;

  @Prop({ type: [String], minlength: 1 })
  actions: string[];
}

@Schema({ collection: 'roles' })
export class Role extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  })
  name: string;

  @Prop({ _id: false, type: mongoose.Types.Array })
  permissions: Permissions[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
