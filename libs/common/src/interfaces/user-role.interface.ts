import { Document } from 'mongoose';

export interface IUserRole extends Document {
  _id: string;
  roleId: string;
  platformName: string;
  userHash: string;
  permissionEntity: any;
}
