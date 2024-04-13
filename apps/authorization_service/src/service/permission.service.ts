import { Injectable } from '@nestjs/common';
import { PermissionRepo } from '../repository/permission.repo';
import { CommonMethods } from '@app/common/common-utils/common-methods';
@Injectable()
export class PermissionService {
  constructor(private permissionRepo: PermissionRepo) {}
  async groupByAllPermission(groupBy: string, plateformName?: string) {
    if (groupBy) {
      const permissions = await this.permissionRepo.findAllpermission(
        {},
        plateformName,
      );
      const groupedPermissions = await CommonMethods.groupItemsByField(
        permissions,
        groupBy,
      );
      const groupedPermissionArray = Object.keys(groupedPermissions).map(
        (key) => ({
          [groupBy]: key,
          items: groupedPermissions[key],
        }),
      );
      return groupedPermissionArray;
    } else {
      return this.permissionRepo.findAllpermission({}, plateformName);
    }
  }
}
