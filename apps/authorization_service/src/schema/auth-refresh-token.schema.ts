import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_refresh_token', timestamps: true })
export class AuthRefreshToken {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  refreshTokenExpiresAt: number;

  @Prop()
  clientId: string;

  @Prop()
  userId: string;

  @Prop()
  orgId: string;

  @Prop({ nullable: true })
  lastUsedAt: Date;
}

export const AuthRefreshTokenSchema =
  SchemaFactory.createForClass(AuthRefreshToken);
