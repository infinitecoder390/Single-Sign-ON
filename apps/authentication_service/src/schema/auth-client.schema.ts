import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_client', timestamps: true })
export class AuthClient {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  clientName: string;

  @Prop()
  clientSecret: string;

  @Prop()
  clientDescription: string;

  @Prop({ nullable: true })
  accessTokenExpiry: number;

  @Prop({ nullable: true })
  authCodeExpiry: number = 300;

  @Prop({ nullable: true })
  otpExpiryInSeconds: number = 300;

  @Prop({ nullable: true })
  defaultOtp: number;

  @Prop({ nullable: true })
  otpResendAllowed: number = 3;

  @Prop({ nullable: true })
  otpAttemptAllowed: number = 3;

  @Prop({ nullable: true })
  refreshTokenExpiry: number;

  @Prop({ required: true })
  platformName: string;

  @Prop()
  userdb: string;
}

export const AuthClientSchema = SchemaFactory.createForClass(AuthClient);
