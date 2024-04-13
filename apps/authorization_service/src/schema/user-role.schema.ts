import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'user_role', timestamps: true })
export class UserRole {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop({ required: true })
  roleId: string;

  @Prop({ required: true })
  platformName: string;

  @Prop({ required: true })
  userHash: string;

  @Prop({ type: Object, required: true })
  permissionEntity: any;
}

export const UseRoleSchema = SchemaFactory.createForClass(UserRole);
