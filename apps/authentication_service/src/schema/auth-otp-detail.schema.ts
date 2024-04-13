import { AUTH_OTP_TYPE } from '@app/common/enums/auth-enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_otp_detail', timestamps: true })
export class AuthOtpDetail {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  otp: string;

  @Prop()
  refId: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ nullable: true })
  phone: string;

  @Prop({ nullable: true })
  countryCode: string;

  @Prop({ nullable: true })
  email: string;

  @Prop()
  expiryTime: number;

  @Prop({ nullable: true })
  expiresAt: Date;

  @Prop()
  blocked: boolean = false;

  @Prop({ nullable: true })
  unblockTimeInMillis: number;

  @Prop({
    type: 'string',
    enum: AUTH_OTP_TYPE,
    nullable: false,
  })
  otpType: AUTH_OTP_TYPE;

  @Prop()
  clientId: string;

  @Prop({ default: 0 })
  verifyOtpAttempt: number;
  @Prop()
  lastGetOtpAttemptedInMillis: number;
  @Prop()
  lastGetOtpBlockedAttemptInMillis: number;
  @Prop({ default: 0 })
  resendOtp: number;

  @Prop({ default: false })
  validated: boolean;
}
export const AuthOtpDetailSchema = SchemaFactory.createForClass(AuthOtpDetail);
