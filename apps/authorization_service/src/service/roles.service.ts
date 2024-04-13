import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepo } from '../repository/roles.repo';
import { Role } from '../schema/roles.schema';
import { CreateRoleDto } from '../dto/roles.dto';
import { CommonMethods } from '@app/common/common-utils/common-methods';
import { PermissionRepo } from '../repository/permission.repo';
@Injectable()
export class RolesService {
  constructor(
    private roleRepo: RoleRepo,
    private permissionRepo: PermissionRepo,
  ) {}
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    return this.roleRepo.findRolesByIds(roleIds);
  }
  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.findRoleByQuery({ roleId: dto.roleId });

    if (existingRole.length) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1085'));
    }

    const checkPermissions = await this.permissionRepo.findPermissionsByIds(
      dto.permissionIds,
    );

    if (checkPermissions.length === 0) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1086'));
    }

    const createdRole = await this.roleRepo.createRole(dto);
    return createdRole;
  }

  async updateRoleById(id: string, dto: Partial<CreateRoleDto>): Promise<Role> {
    if (dto.roleId) {
      const existingRole = await this.findRoleByQuery({ roleId: dto.roleId });
      if (existingRole.length) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1085'));
      }
    }
    if (dto.permissionIds) {
      const checkPermissions = await this.permissionRepo.findPermissionsByIds(
        dto.permissionIds,
      );
      if (checkPermissions.length === 0) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1086'));
      }
    }
    const updatedRole = await this.roleRepo.updateById(id, dto);
    if (!updatedRole) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return updatedRole;
  }
  async getAllUserRoles(): Promise<Role[]> {
    return await this.roleRepo.findAllRoles();
  }
  async deleteRoleById(id: string): Promise<Role> {
    const deletedRole = await this.roleRepo.deleteById(id);
    if (!deletedRole) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return deletedRole;
  }
  async findRoleByQuery(query: any): Promise<Role[]> {
    const result = await this.roleRepo.findByQuery({ ...query });
    return result;
  }
  async bulkCreateOrUpdateRoles(createRoleDto: CreateRoleDto[]) {
    try {
      const result = await this.roleRepo.upsertRoles(createRoleDto);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
