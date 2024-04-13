import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty()
  codeVerifier: string;
  @ApiProperty()
  authCode: string;

  email: string;
  phone: string;
}
