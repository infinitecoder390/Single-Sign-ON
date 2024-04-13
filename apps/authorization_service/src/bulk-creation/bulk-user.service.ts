import { Injectable } from '@nestjs/common';
import { InputBulkUserDto } from '../dto/society-user.dto';
import { UserRoleRepo } from '../repository/user-role.repo';
import { IUserRole } from '@app/common/interfaces/user-role.interface';
import { RolesService } from '../service/roles.service';
import { CreateUserRoleDto } from '../dto/user-roles.dto';

@Injectable()
export class BulkUserService {
  constructor(
    private readonly repo: UserRoleRepo,
    private rolesService: RolesService,
  ) {}

  // this function is getting user for client validation and sending request forword
  async createBulkUserRole(
    clientId: string,
    bulkUserDto: InputBulkUserDto[],
  ): Promise<IUserRole[]> {
    try {
      const data = await this.create(bulkUserDto);
      return data;
    } catch (error) {
      throw error;
    }
  }

  //In this function, We are filtering out valid dtos to save in db.
  async create(bulkUserDto: InputBulkUserDto[]): Promise<IUserRole[]> {
    try {
      // Extract unique role IDs from bulkUserDto
      const roleIds = [
        ...new Set(bulkUserDto.map((userDto) => userDto.roleId)),
      ];

      // Fetch roles by their IDs
      const roles = await this.rolesService.findRolesByIds(roleIds);

      const userDtos: CreateUserRoleDto[] = [];

      bulkUserDto.forEach((userDto) => {
        const matchedRole = roles.find(
          (role) => role.roleId === userDto.roleId,
        );
        if (matchedRole) {
          const tempUserDto = new CreateUserRoleDto();
          tempUserDto.platformName = matchedRole.platformName;
          tempUserDto.userHash = userDto.userHash;
          tempUserDto.permissionEntity = userDto.permissionEntity;
          tempUserDto.roleId = userDto.roleId;
          userDtos.push(tempUserDto);
        }
      });

      return await this.repo.upsertUser(userDtos);
    } catch (error) {
      throw error;
    }
  }
}
