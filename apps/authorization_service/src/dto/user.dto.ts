import { CommonMethods } from '@app/common/common-utils/common-methods';
import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty({ message: CommonMethods.getSsoErrorMsg('SSO_1080') })
  userHash: string;

  platform: string;
}
