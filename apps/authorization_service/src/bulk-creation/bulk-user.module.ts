import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BulkUserService } from './bulk-user.service';
import { BulkUserController } from './bulk-user.controller';
import { UseRoleSchema } from '../schema/user-role.schema';
import { RoleSchema } from '../schema/roles.schema';
import { UserRoleRepo } from '../repository/user-role.repo';
import { RolesService } from '../service/roles.service';
import { RoleRepo } from '../repository/roles.repo';
import { LoggerService } from '../logger/logger.service';
import { PermissionSchema } from '../schema/permission.schema';
import { PermissionRepo } from '../repository/permission.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserRole', schema: UseRoleSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'Permission', schema: PermissionSchema },
    ]),
  ],
  controllers: [BulkUserController],
  providers: [
    BulkUserService,
    LoggerService,
    UserRoleRepo,
    RolesService,
    RoleRepo,
    PermissionRepo,
  ],
})
export class BulkUserModule {}
