import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'roles', timestamps: true })
export class Role extends Document {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop({ required: true })
  roleId: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: false })
  displayOrder: number;

  @Prop({ required: true })
  platformName: string;

  @Prop()
  isAdmin: boolean;

  @Prop()
  isDefault: boolean;

  @Prop({ required: true, type: [String] })
  permissionIds: string[];

  @Prop({ type: Object })
  permissionEntity: any;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
