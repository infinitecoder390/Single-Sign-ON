import { Document } from 'mongoose';
import { AUTH_OTP_TYPE } from '../enums/auth-enum';

export interface IAuthOtpDetail extends Document {
  otp: string;

  refId: string;

  retryCount: number;

  phone: string;

  countryCode: string;
  email: string;

  expiryTime: number;

  expiresAt: Date;

  blocked: boolean;

  unblockTimeInMillis: number;

  otpType: AUTH_OTP_TYPE;

  clientId: string;

  verifyOtpAttempt: number;
  lastGetOtpAttemptedInMillis: number;
  lastGetOtpBlockedAttemptInMillis: number;
  resendOtp: number;
  validated: boolean;
}
