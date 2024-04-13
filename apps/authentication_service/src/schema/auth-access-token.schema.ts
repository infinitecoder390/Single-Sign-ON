import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_access_token', timestamps: true })
export class AuthAccessToken {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  accessTokenExpiresAt: number;

  @Prop()
  clientId: string;

  @Prop()
  userId: string;

  @Prop()
  refreshTokenId: string;
}

export const AuthAccessTokenSchema =
  SchemaFactory.createForClass(AuthAccessToken);
