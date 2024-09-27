import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VALID_RESOURCES } from 'src/auth/constants';
@Schema({ _id: false })
export class Permission {
  @Prop({
    type: String,
    enum: Object.values(VALID_RESOURCES),
  })
  resource: VALID_RESOURCES;

  @Prop({ type: [String], minlength: 1 })
  actions: string[];
}

const PermissionSchema = SchemaFactory.createForClass(Permission);

@Schema()
export class Role extends Document {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({ type: [PermissionSchema], default: [] })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
