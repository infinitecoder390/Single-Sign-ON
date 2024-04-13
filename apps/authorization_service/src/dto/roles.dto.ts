export class CreateRoleDto {
  _id?: string;
  roleId: string;
  displayName?: string;
  displayOrder?: number;
  platformName?: string;
  isAdmin: boolean;
  isDefault: boolean;
  permissionIds: string[];
  permissionEntity?: any;
}
