import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthClientDto {
  @ApiProperty()
  userdb: string;

  @ApiProperty()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty()
  @IsNotEmpty()
  clientDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  accessTokenExpiry: number;

  defaultOtp: string;

  @ApiProperty()
  @IsNotEmpty()
  refreshTokenExpiry: number;

  @ApiProperty()
  @IsNotEmpty()
  otpExpiryInSeconds: number;
  @ApiProperty()
  otpResendAllowed: number;

  @ApiProperty()
  otpAttemptAllowed: number;

  @ApiProperty()
  otpBlockIntervalInMins: number;

  @ApiProperty()
  @IsNotEmpty()
  authCodeExpiry: number;

  clientSecret: string;

  _id: string;
}

export class UpdatAuthClientDto implements Partial<CreateAuthClientDto> {}
