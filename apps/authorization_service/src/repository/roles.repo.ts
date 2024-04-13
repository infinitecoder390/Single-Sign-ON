import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../schema/roles.schema';
import { CreateRoleDto } from '../dto/roles.dto';

@Injectable()
export class RoleRepo {
  constructor(@InjectModel('Role') private roleModel: Model<Role>) {}

  // to get roles on the basis of role ids so we can filter it out on the requirement basis.
  async findRolesByIds(roleIds: string[]): Promise<Role[]> {
    return this.roleModel.find({ roleId: { $in: roleIds } });
  }

  // find by id
  async findById(id: string): Promise<Role> {
    return this.roleModel.findById(id);
  }

  // create User Role
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const userRole = await new this.roleModel(dto);
    return userRole.save();
  }

  // update User role
  async updateById(id: string, dto: Partial<CreateRoleDto>): Promise<Role> {
    const existing = await this.roleModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    return existing;
  }

  // find All user roles
  async findAllRoles(): Promise<Role[]> {
    const list = await this.roleModel.find();
    return list;
  }

  // delete user role by id
  async deleteById(id: string): Promise<Role> {
    const existing = await this.roleModel.findByIdAndDelete(id);
    return existing;
  }
  // find by query
  async findByQuery(query: any): Promise<Role[]> {
    return await this.roleModel.find({ ...query });
  }
  async upsertRoles(createRoleDto: CreateRoleDto[]) {
    try {
      const operations = createRoleDto.map((dto) => ({
        updateOne: {
          filter: {
            roleId: dto.roleId,
          },
          update: dto,
          upsert: true,
        },
      }));
      await this.roleModel.bulkWrite(operations, { ordered: false });
      // After the bulk operation, return the updated records.
      const updatedRecords = await this.roleModel.find({
        $or: createRoleDto.map((dto) => ({
          roleId: dto.roleId,
        })),
      });
      return updatedRecords;
    } catch (error) {
      throw error;
    }
  }
}
