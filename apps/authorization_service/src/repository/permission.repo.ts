import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../schema/permission.schema';

@Injectable()
export class PermissionRepo {
  constructor(
    @InjectModel('Permission')
    private permissionModel: Model<Permission>,
  ) {}
  async findPermissionsByIds(permissionIds: string[]): Promise<Permission[]> {
    const perms = await this.permissionModel.find({
      permissionId: { $in: permissionIds },
    });

    return perms;
  }
  async findAllpermission(query: any, platformName?: string) {
    const queryParams = {};
    if (platformName) {
      queryParams['platformName'] = platformName;
    }
    if (query) {
      Object.assign(queryParams, query);
    }

    const permissions = await this.permissionModel.find(queryParams);
    return permissions;
  }
}
