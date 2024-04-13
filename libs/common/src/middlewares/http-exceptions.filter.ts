import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '@app/common/dtos/error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorRes = exception.getResponse();

    const message =
      typeof errorRes === 'object' && typeof errorRes['message'] === 'object'
        ? errorRes['message'][0]
        : errorRes['message'];
    const errorResponseDto: ErrorResponseDto =
      ErrorResponseDto.getFilledResponseObjectAllArgs(
        null,
        message.split(':-')[1],
        message.split(':-')[0],
      );
    response.status(status).json(errorResponseDto);
  }
}
