import { Document } from 'mongoose';

export interface IAuthClient extends Document {
  clientName: string;

  clientSecret: string;

  clientDescription: string;

  accessTokenExpiry: number;

  authCodeExpiry: number;

  otpExpiryInSeconds: number;

  defaultOtp: number;

  otpResendAllowed: number;

  otpAttemptAllowed: number;

  refreshTokenExpiry: number;

  userdb: string;

  platformName: string;
}
