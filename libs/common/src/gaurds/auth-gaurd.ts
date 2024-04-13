import { RestService } from '@app/common/rest-service/rest.service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { LoggerService } from 'apps/authentication_service/src/logger/logger.service';
import { CheckAuthDto } from 'apps/authorization_service/src/dto/check-auth.dto';
import { AuthorizationService } from 'apps/authorization_service/src/service';
import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
    private restService: RestService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  logger: LoggerService = new LoggerService();
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    let isValid = false;
    const req = context.switchToHttp().getRequest();
    const dto = new CheckAuthDto();
    dto.jwt = req.headers['authorization']?.split(' ')[1];
    dto.apiEndPoint = '/sso' + req.originalUrl;
    dto.host = req.get('host');
    dto.protocol = req.protocol;
    dto.httpMethod = req.method;

    try {
      const response = await this.authorizationService.checkAuthorization(dto);

      isValid = response['sub'] ? true : false;
      req.userId = response['sub'];
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new BadRequestException(error.message);
      }
    }
    return isValid;
  }
}
