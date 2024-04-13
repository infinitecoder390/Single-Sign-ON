import { IsArray, IsString } from 'class-validator';

export class BulkFetchUserRoleDto {
  key: string;

  @IsArray()
  data: any[];

  @IsArray()
  @IsString({ each: true })
  selectedFields: string[];
}
