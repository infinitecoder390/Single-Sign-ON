import {
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsMobilePhone,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonMethods } from '@app/common/common-utils/common-methods';

export class LoginRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail(
    {},
    {
      message: CommonMethods.getSsoErrorMsg('SSO_1070'),
    },
  )
  email: string;

  @IsOptional()
  @IsMobilePhone(
    'en-IN',
    {},
    {
      message: CommonMethods.getSsoErrorMsg('SSO_1091'),
    },
  )
  @MaxLength(10, {
    message: CommonMethods.getSsoErrorMsg('SSO_1090'),
  })
  @MinLength(10, {
    message: CommonMethods.getSsoErrorMsg('SSO_1090'),
  })
  phone: string;

  @IsOptional()
  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(150, {
    message: CommonMethods.getSsoErrorMsg('SSO_1078'),
  })
  @MinLength(43, {
    message: CommonMethods.getSsoErrorMsg('SSO_1078'),
  })
  codeChallenge: string;

  @ApiProperty()
  codeVerifier: string;
  @ApiProperty()
  authCode: string;

  @ApiProperty()
  otp: string;

  @ApiProperty()
  refId: string;

  clientId: string;
}
