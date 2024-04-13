import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BulkUserService } from './bulk-user.service';
import { InputBulkUserReqDto } from '../dto/society-user.dto';
import { SuccessResponseDto } from '@app/common/dtos/success-response.dto';
import { ErrorResponseDto } from '@app/common/dtos/error-response.dto';
import { LoggerService } from '../logger/logger.service';

@Controller({
  version: '1',
  path: 'users',
})
export class BulkUserController {
  constructor(
    private bulkUserService: BulkUserService,
    private loggerService: LoggerService,
  ) {}

  //This function is creating roles for bulk user
  @Post('/roles')
  @HttpCode(HttpStatus.OK)
  async createBulkUserRole(
    @Headers('client_id') clientId: string,
    @Body() bulkUserReqDto: InputBulkUserReqDto,
  ) {
    try {
      const result = await this.bulkUserService.createBulkUserRole(
        clientId,
        bulkUserReqDto.data,
      );
      return SuccessResponseDto.getFilledResponseObjectAllArgs(
        result,
        'User roles created and updated successfully.',
        '200',
      );
    } catch (error) {
      this.loggerService.error('error in bulkUserRoleCreate --->' + error);
      return ErrorResponseDto.getFilledResponseObjectFromDataAndMessage(
        error,
        'somthing went wrong',
      );
    }
  }
}
