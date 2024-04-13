import { IUserRole } from '@app/common/interfaces/user-role.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRoleRepo } from '../repository/user-role.repo';
import { CreateUserRoleDto } from '../dto/user-roles.dto';
import { CommonMethods } from '@app/common/common-utils/common-methods';
import { RoleRepo } from '../repository/roles.repo';
import { RestService } from '@app/common/rest-service/rest.service';
import { ConfigService } from '@nestjs/config';
import { PermissionRepo } from '../repository/permission.repo';
import { ApplicationConstants } from '../utils/application-contants';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthAccessTokenService } from './auth-access-token.service';
@Injectable()
export class UserRoleService {
  constructor(
    private userRoleRepo: UserRoleRepo,
    private roleRepo: RoleRepo,
    private restService: RestService,
    private configService: ConfigService,
    private permissionRepo: PermissionRepo,
    private authRefreshTokenService: AuthRefreshTokenService,
    private authAccessTokenService: AuthAccessTokenService,
  ) {}
  async findRolesByUserId(
    userId: string,
    platformName: string,
  ): Promise<IUserRole[]> {
    return await this.userRoleRepo.findRolesByUserId(userId, platformName);
  }
  async updateRoleById(
    id: string,
    dto: Partial<CreateUserRoleDto>,
  ): Promise<IUserRole> {
    const updatedUserRole = await this.userRoleRepo.updateById(id, dto);
    if (!updatedUserRole) {
      throw new NotFoundException(`User Role with id ${id} not found`);
    }
    return updatedUserRole;
  }
  async getRolesByUserId(
    userId: string,
    platformName: string,
  ): Promise<IUserRole[]> {
    const roles = await this.userRoleRepo.findRolesByUserId(
      userId,
      platformName,
    );
    return roles;
  }
  async getUserRoleById(id: string): Promise<IUserRole> {
    const userRole = await this.userRoleRepo.findById(id);
    if (!userRole) {
      throw new NotFoundException(`User Role with id ${id} not found`);
    }
    return userRole;
  }
  async createUserRole(dto: CreateUserRoleDto): Promise<IUserRole> {
    const createdUserRole = await this.userRoleRepo.createUserRole(dto);
    return createdUserRole;
  }
  async getAllUserRolesByPlatform(query: any, platformName?: string) {
    const queryParams = {};
    if (platformName) {
      queryParams['platformName'] = platformName;
    }
    if (query) {
      Object.assign(queryParams, query);
    }
    const userRoles =
      await this.userRoleRepo.getAllUserRolesByPlatform(queryParams);

    return userRoles;
  }
  async getAllUserRoles(query: any, platformName?: string) {
    const queryParams: any = {};

    if (platformName) {
      queryParams.platformName = platformName;
    }
    if (
      query['permissionGroup'] &&
      query['permissionGroup'] != ApplicationConstants.UNDEFINED_STRING
    ) {
      const permissionsIds = (
        await this.permissionRepo.findAllpermission(
          { permissionGroup: query['permissionGroup'] },
          queryParams.platformName,
        )
      ).map((aperm) => aperm.permissionId);
      const roleIds = (
        await this.roleRepo.findByQuery({
          platformName: platformName,
          'permissionEntity.orgId': query['permissionEntity.orgId'],
          permissionIds: { $in: permissionsIds },
        })
      ).map((arole) => arole.roleId);

      if (roleIds && roleIds.length > 0) {
        queryParams['roleId'] = { $in: roleIds };
      }
    }

    if (
      query['permissionIds'] &&
      query['permissionIds'] != ApplicationConstants.UNDEFINED_STRING
    ) {
      const roleIds = (
        await this.roleRepo.findByQuery({
          platformName: platformName,
          'permissionEntity.orgId': query['permissionEntity.orgId'],
          permissionIds: { $in: query['permissionIds'].split(',') },
        })
      ).map((arole) => arole.roleId);

      if (roleIds && roleIds.length > 0) {
        queryParams['roleId'] = { $in: roleIds };
      }
    }

    delete query.permissionIds;
    delete query.permissionGroup;

    if (query) {
      if (query.includeAdmin === ApplicationConstants.TRUE_STRING) {
        delete query.includeAdmin;
        queryParams['$or'] = [
          { roleId: `DXP_ORG_ADMIN_${query['permissionEntity.orgId']}` },
          {
            'permissionEntity.orgId': query['permissionEntity.orgId'],
            'permissionEntity.projectId': query['permissionEntity.projectId'],
          },
        ];
      } else Object.assign(queryParams, query);
    }

    const userRoles =
      await this.userRoleRepo.getAllUserRolesByPlatform(queryParams);

    if (userRoles && userRoles.length > 0) {
      const result = await Promise.all(
        userRoles.map(async (element) => {
          const userData = await this.getUserData(element.userHash);
          const roleResp = await this.roleRepo.findByQuery({
            roleId: element.roleId,
          });
          return {
            userHash: element.userHash,
            userRoleId: element._id,
            user: userData,
            role: roleResp && roleResp.length > 0 ? roleResp[0] : null,
            permissionEntity: element.permissionEntity,
          };
        }),
      );
      return result;
    }
    return [];
  }

  async deleteUsersSessionDetails(userIds: string[]): Promise<boolean> {
    if (!userIds || userIds.length < 1) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1077'));
    }
    let usersSessionDeleted = false;
    const accessTokenDeleted =
      await this.authAccessTokenService.deleteUsersAccessToken(userIds);
    if (accessTokenDeleted) {
      usersSessionDeleted =
        await this.authRefreshTokenService.deleteUsersRefreshToken(userIds);
    }
    return usersSessionDeleted;
  }

  async getUserData(userHash: string) {
    try {
      const response = await this.restService.get(
        `${this.configService.get(
          'GIGA_PROFILE_ENDPOINT',
        )}/giga-profile/v1/${userHash}`,
      );
      return response.data;
    } catch (error) {
      return error;
    }
  }
  async deleteUserRoleById(id: string): Promise<IUserRole> {
    const deletedUserRole = await this.userRoleRepo.deleteById(id);
    if (!deletedUserRole) {
      throw new NotFoundException(`User Role with id ${id} not found`);
    }
    return deletedUserRole;
  }
  async createOrUpdateUserRoles(createUserRoleDto: CreateUserRoleDto[]) {
    try {
      const result = await this.userRoleRepo.upsertUser(createUserRoleDto);

      const userIds = createUserRoleDto.map((ur) => ur.userHash);
      await this.deleteUsersSessionDetails(userIds);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async deleteUserRoleByQuery(query: any) {
    const deletedUserRole = await this.userRoleRepo.deleteByQuery({ ...query });
    const userIds = deletedUserRole.map((ur) => ur.userHash);
    await this.deleteUsersSessionDetails(userIds);

    return deletedUserRole;
  }
  async groupByUsers(groupBy: string, platformName?: string) {
    const userRoles = await this.getAllUserRolesByPlatform({}, platformName);
    const groupedUsers = await CommonMethods.groupItemsByField(
      userRoles,
      groupBy,
    );
    const groupedUsersArray = await Promise.all(
      Object.keys(groupedUsers).map(async (key) => {
        const roleName =
          (await this.roleRepo.findByQuery({ roleId: key }))[0]?.displayName ||
          key;
        const items = await Promise.all(
          groupedUsers[key].map(async (element) => {
            const response = await this.restService.get(
              `${this.configService.get(
                'GIGA_PROFILE_ENDPOINT',
              )}/giga-profile/v1/${element.userHash}`,
            );
            return response.data;
          }),
        );
        return {
          roleName,
          items,
        };
      }),
    );

    return groupedUsersArray;
  }
}
