import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_audit', timestamps: true })
export class AuthAudit {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  clientId: string;

  @Prop()
  userId: string;

  @Prop()
  orgId: string;
}

export const AuthAuditSchema = SchemaFactory.createForClass(AuthAudit);
