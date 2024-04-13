import { Module } from '@nestjs/common';
import { AuthService } from './service';
import { AuthController } from './controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthClientSchema } from './schema/auth-client.schema';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { AuthClientService } from './service/auth-client.service';
import { AuthClientRepo } from './repository/auth-client.repo';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';
import { AuthPkceService } from './service/auth-pkce.service';
import { AuthPkceRepo } from './repository/auth-pkce.repo';
import { AuthOtpDetailService } from './service/auth-otp-detail.service';
import { AuthOtpDetailRepo } from './repository/auth-otp-detail.repo';
import { AuthAccessTokenSchema } from './schema/auth-access-token.schema';
import { AuthPkceSchema } from './schema/auth-pkce.schema';
import { AuthRefreshTokenSchema } from './schema/auth-refresh-token.schema';
import { AuthOtpDetailSchema } from './schema/auth-otp-detail.schema';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';
import { UserModule } from './user/user.module';
import { UserService } from './user/service/user.service';
import { PrometheusModule } from './prometheus/prometheus.module';
import { AnyOtherModuleModule } from './any-other-module/any-other-module.module';
import { HealthModule } from './health/health.module';
import { RestServiceModule } from '@app/common/rest-service/rest-service.module';
@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: 'AuthClient', schema: AuthClientSchema },
      { name: 'AuthAccessToken', schema: AuthAccessTokenSchema },
      { name: 'AuthPkce', schema: AuthPkceSchema },
      { name: 'AuthAccessToken', schema: AuthAccessTokenSchema },
      { name: 'AuthRefreshToken', schema: AuthRefreshTokenSchema },
      { name: 'AuthOtpDetail', schema: AuthOtpDetailSchema },
    ]),
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: `./apps/authentication_service/.env`,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    HealthModule,
    PrometheusModule,
    AnyOtherModuleModule,
    RestServiceModule,
  ],
  controllers: [AuthController],
  providers: [
    LoggerService,
    AuthService,
    UserService,
    AuthAccessTokenService,
    AuthAccessTokenRepo,
    AuthClientService,
    AuthClientRepo,
    AuthRefreshTokenService,
    AuthRefreshTokenRepo,
    AuthPkceService,
    AuthPkceRepo,
    AuthOtpDetailService,
    AuthOtpDetailRepo,
    AnyOtherModuleModule,
    HealthModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
