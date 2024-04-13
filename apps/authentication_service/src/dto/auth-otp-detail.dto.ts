import { AUTH_OTP_TYPE } from '@app/common/enums/auth-enum';
import { PartialType } from '@nestjs/swagger';

export class CreateAuthOtpDetailDto {
  _id?: string;
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

  clientId;

  verifyOtpAttempt: number;
  lastGetOtpAttemptedInMillis: number;
  lastGetOtpBlockedAttemptInMillis: number;
  resendOtp: number;
  validated: boolean;
}

export class UpdatAuthOtpDetailDto extends PartialType(
  CreateAuthOtpDetailDto,
) {}
