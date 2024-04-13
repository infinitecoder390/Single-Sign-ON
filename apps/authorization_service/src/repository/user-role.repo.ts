import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserRoleDto } from '../dto/user-roles.dto';
import { IUserRole } from '@app/common/interfaces/user-role.interface';
import { CommonMethods } from '@app/common/common-utils/common-methods';
@Injectable()
export class UserRoleRepo {
  constructor(
    @InjectModel('UserRole')
    private readonly model: Model<IUserRole>,
  ) {}

  // this is wrriten to create the user and update the user role
  async upsertUser(
    createUserRoleDto: CreateUserRoleDto[],
  ): Promise<IUserRole[]> {
    try {
      const operations = createUserRoleDto.map((dto) => ({
        updateOne: {
          filter: {
            roleId: dto.roleId,
            userHash: dto.userHash,
            permissionEntity: dto.permissionEntity,
          },
          update: dto,
          upsert: true,
        },
      }));
      await this.model.bulkWrite(operations, { ordered: false });

      // After the bulk operation, return the updated records.
      const updatedRecords = await this.model.find({
        $or: createUserRoleDto.map((dto) => ({
          roleId: dto.roleId,
          userHash: dto.userHash,
          permissionEntity: dto.permissionEntity,
        })),
      });
      return updatedRecords;
    } catch (error) {
      throw error;
    }
  }

  // fetch roles from database
  async findAllUserRoles(
    key: string,
    data: any[],
    selectedFields: string[],
  ): Promise<IUserRole[]> {
    try {
      const query = { [key]: { $in: data } };

      const projection = {};
      projection['_id'] = 0;
      projection['userHash'] = 1;
      selectedFields.forEach((field) => {
        projection[field] = 1;
      });
      const roles = await this.model.find(query).select(projection).exec();

      return roles;
    } catch (err) {
      throw err;
    }
  }

  // find by userid and platform Name
  async findRolesByUserId(
    userId: string,
    platformName: string,
  ): Promise<IUserRole[]> {
    return await this.model.find({ userHash: userId, platformName });
  }

  // find by id
  async findById(id: string): Promise<IUserRole> {
    return this.model.findById(id);
  }

  // create User Role
  async createUserRole(dto: CreateUserRoleDto): Promise<IUserRole> {
    const userRole = await new this.model(dto);
    return userRole.save();
  }

  // update User role
  async updateById(
    id: string,
    dto: Partial<CreateUserRoleDto>,
  ): Promise<IUserRole> {
    const existing = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });
    return existing;
  }

  // find All user roles
  async getAllUserRolesByPlatform(query: any): Promise<IUserRole[]> {
    const list = await this.model.find(query);
    return list;
  }

  // delete user role by id
  async deleteById(id: string): Promise<IUserRole> {
    const existing = await this.model.findByIdAndDelete(id);
    return existing;
  }
  async deleteByQuery(query: any) {
    const userRoles = await this.model.find({ ...query }).exec();

    const output = [];
    if (userRoles && userRoles.length > 0) {
      for (let i = 0; i < userRoles.length; i++) {
        const result = await this.deleteById(userRoles[i]._id);
        output.push(result);
      }
      return output;
    } else {
      throw new NotFoundException(CommonMethods.getSsoErrorMsg('SSO_1084'));
    }
  }
}
