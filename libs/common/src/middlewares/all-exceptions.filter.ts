import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommonMethods } from '../common-utils/common-methods';
import { ErrorResponseDto } from '@app/common/dtos/error-response.dto';
import { LoggerService } from '../../../../apps/authorization_service/src/logger/logger.service';
import { ApplicationConstants } from '../../../../apps/authentication_service/src/utils/application-contants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: LoggerService;
  constructor() {
    this.logger = new LoggerService();
  }
  catch(exception: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      'Environment :' + process.env.NODE_ENV + ', Error --> ' + exception,
    );

    const errorResponseDto: ErrorResponseDto =
      ErrorResponseDto.getFilledResponseObjectAllArgs(
        process.env.NODE_ENV === ApplicationConstants.DEV_ENV
          ? exception
          : null,
        CommonMethods.getSsoErrorMsg('SSO_1071').split(':-')[1],
        'SSO_1071',
      );
    response.status(statusCode).json(errorResponseDto);
  }
}
