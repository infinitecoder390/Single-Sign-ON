import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from 'apps/authentication_service/src/health/health.module';
import { PrometheusModule } from 'apps/authentication_service/src/prometheus/prometheus.module';
import { AnyOtherModuleModule } from './any-other-module/any-other-module.module';
import { AuthorizationServiceController } from './controller';
import { LoggerService } from './logger/logger.service';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { AuthAuditRepo } from './repository/auth-audit.repo';
import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';
import { AuthAccessTokenSchema } from './schema/auth-access-token.schema';
import { AuthAuditSchema } from './schema/auth-audit.schema';
import { AuthRefreshTokenSchema } from './schema/auth-refresh-token.schema';
import { AuthorizationService } from './service';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthAuditService } from './service/auth-audit.service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { BulkUserModule } from './bulk-creation/bulk-user.module';
import { RestServiceModule } from '@app/common/rest-service/rest-service.module';
import { RoleRepo } from './repository/roles.repo';
import { UserRoleRepo } from './repository/user-role.repo';
import { PermissionRepo } from './repository/permission.repo';
import { RoleSchema } from './schema/roles.schema';
import { UseRoleSchema } from './schema/user-role.schema';
import { PermissionSchema } from './schema/permission.schema';
import { RolesService } from './service/roles.service';
import { UserRoleService } from './service/user-role.service';
import { PermissionService } from './service/permission.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AuthAccessToken', schema: AuthAccessTokenSchema },
      { name: 'AuthRefreshToken', schema: AuthRefreshTokenSchema },
      { name: 'AuthAudit', schema: AuthAuditSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'UserRole', schema: UseRoleSchema },
      { name: 'Permission', schema: PermissionSchema },
    ]),

    JwtModule.register({}),

    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `./apps/authorization_service/.env`,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    HealthModule,
    PrometheusModule,
    AnyOtherModuleModule,
    BulkUserModule,
    RestServiceModule,
  ],
  controllers: [AuthorizationServiceController],
  providers: [
    AuthorizationService,
    AuthAccessTokenService,
    AuthRefreshTokenService,
    AuthAccessTokenRepo,
    AuthRefreshTokenRepo,
    RolesService,
    UserRoleService,
    PermissionService,
    RoleRepo,
    UserRoleRepo,
    PermissionRepo,
    AuthAuditService,
    AuthAuditRepo,
    LoggerService,
    {
      provide: 'AUTHENTICATION_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: configService.get('AUTHENTICATION_SERVICE_TCP_PORT'),
          },
        }),
    },
    {
      provide: 'ADMIN_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: configService.get('ADMIN_SERVICE_TCP_PORT'),
          },
        }),
    },
    AnyOtherModuleModule,
  ],
})
export class AuthorizationServiceModule {}
