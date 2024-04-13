import { CommonMethods } from '@app/common/common-utils/common-methods';
import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { IsNonEmptyObject } from '../utils/custom-validation-decorator';

export class InputBulkUserReqDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputBulkUserDto)
  data: InputBulkUserDto[];
}

export class InputBulkUserDto {
  @IsNotEmpty({ message: CommonMethods.getSsoErrorMsg('SSO_1080') })
  userHash: string;

  @IsNotEmpty({ message: CommonMethods.getSsoErrorMsg('SSO_1081') })
  roleId: string;

  @Optional()
  platformName?: string;

  @Type(() => Object)
  @ValidateNested()
  @IsNonEmptyObject({ message: 'permissionEntity must be a non-empty object' })
  permissionEntity: any;
}
