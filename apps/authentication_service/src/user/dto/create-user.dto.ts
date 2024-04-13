import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonMethods } from '@app/common/common-utils/common-methods';

export class CreateUserDto {
  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: CommonMethods.getSsoErrorMsg('SSO_1070'),
    },
  )
  email: string;

  emailVerified: boolean;
  phoneVerified: boolean;
  _id: string;
  orgId: string;
}
