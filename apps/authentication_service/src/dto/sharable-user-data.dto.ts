import { ApiProperty } from '@nestjs/swagger';

export class SharableUserData {
  @ApiProperty()
  otp: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  refId: string;
}
