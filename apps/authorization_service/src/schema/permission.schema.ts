import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
@Schema({ collection: 'permission', timestamps: true })
export class Permission extends Document {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop({ required: true })
  permissionId: string;

  @Prop({ required: true })
  platformName: string;

  @Prop({ type: [String], required: true })
  scopes: string[];

  @Prop({ type: [String], required: true })
  feScopes: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  permissionGroup: string;

  @Prop()
  displayName: string;

  @Prop()
  displayOrder: number;

  @Prop()
  groupDisplayOrder: number;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
