import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepo } from '../repository/roles.repo';
import { Role } from '../schema/roles.schema';
import { CreateRoleDto } from '../dto/roles.dto';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { PermissionRepo } from '../repository/permission.repo';
import { Permission } from '../schema/permission.schema';

describe('RolesService', () => {
  let rolesService: RolesService;
  let roleRepoMock: RoleRepo;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        RoleRepo,
        PermissionRepo,
        {
          provide: getModelToken(Role.name),
          useValue: {
            find: jest.fn(() => Promise.resolve([])),
          },
        },
        {
          provide: getModelToken(Permission.name),
          useValue: {
            find: jest.fn(() => Promise.resolve([{ _id: 'PERMISSION THERE' }])),
          },
        },
      ],
    }).compile();
    rolesService = module.get<RolesService>(RolesService);
    roleRepoMock = module.get<RoleRepo>(RoleRepo);
  });

  describe('findRolesByIds', () => {
    it('should call roleRepo.findRolesByIds with correct parameters and return the result', async () => {
      const roleIds = [
        'SERVICE_COMMERCE_AGENCY_PERMISSION',
        'SERVICE_COMMERCE_PARTNER_PERMISSION',
      ];
      const mockResult: Role[] = [
        {
          _id: '65e1bbe2f76439ad4fcafb68',
          roleId: 'SERVICE_COMMERCE_PARTNER_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_PARTNER_PERMISSION'],
          displayName: 'Service Commerce PARTNER Admin',
        } as any,
        {
          _id: '65e1bbe2f76439ad4fcafb68',
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
          displayName: 'Service Commerce Agency Admin',
        } as any,
      ];
      roleRepoMock.findRolesByIds = jest.fn().mockResolvedValue(mockResult);
      const result = await rolesService.findRolesByIds(roleIds);
      expect(roleRepoMock.findRolesByIds).toHaveBeenCalledWith(roleIds);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRoleById', () => {
    it('should call roleRepo.findById with correct parameters and return the result', async () => {
      const roleId = '65e1bbe2f76439ad4fcafb68';
      const mockResult: Role = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        displayName: 'Service Commerce Agency Admin',
      } as any;

      roleRepoMock.findById = jest.fn().mockResolvedValue(mockResult);

      const result = await rolesService.getRoleById(roleId);

      expect(roleRepoMock.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if roleRepo.findById returns falsy value', async () => {
      roleRepoMock.findById = jest.fn().mockResolvedValue(null);

      await expect(rolesService.getRoleById('id1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateRoleById', () => {
    it('should call roleRepo.updateById with correct parameters and return the result', async () => {
      const roleId = 'id1';
      const updateRoleDto: Partial<CreateRoleDto> = {
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
      };
      const mockResult: Role = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        displayName: 'Service Commerce Agency Admin',
      } as any;

      roleRepoMock.updateById = jest.fn().mockResolvedValue(mockResult);
      const result = await rolesService.updateRoleById(roleId, updateRoleDto);
      expect(roleRepoMock.updateById).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if roleRepo.updateById returns falsy value', async () => {
      roleRepoMock.updateById = jest.fn().mockResolvedValue(null);
      await expect(
        rolesService.updateRoleById('id1', {} as Partial<CreateRoleDto>),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('getAllUserRoles', () => {
    it('should call roleRepo.findAllRoles and return the result', async () => {
      const mockResult: Role[] = [
        {
          _id: '65e1bbe2f76439ad4fcafb68',
          roleId: 'SERVICE_COMMERCE_PARTNER_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_PARTNER_PERMISSION'],
          displayName: 'Service Commerce PARTNER Admin',
        } as any,
        {
          _id: '65e1bbe2f76439ad4fcafb62',
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
          displayName: 'Service Commerce Agency Admin',
        } as any,
      ];

      roleRepoMock.findAllRoles = jest.fn().mockResolvedValue(mockResult);

      const result = await rolesService.getAllUserRoles();

      expect(roleRepoMock.findAllRoles).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
  describe('deleteRoleById', () => {
    it('should call roleRepo.deleteById with correct parameters and return the result', async () => {
      const roleId = '65e1bbe2f76439ad4fcafb68';
      const mockResult: Role = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        displayName: 'Service Commerce Agency Admin',
      } as any;

      roleRepoMock.deleteById = jest.fn().mockResolvedValue(mockResult);

      const result = await rolesService.deleteRoleById(roleId);

      expect(roleRepoMock.deleteById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if roleRepo.deleteById returns falsy value', async () => {
      roleRepoMock.deleteById = jest.fn().mockResolvedValue(null);

      await expect(rolesService.deleteRoleById('id1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('findRoleByQuery', () => {
    it('should call roleRepo.findByQuery with correct parameters and return the result', async () => {
      const query = { platformName: 'SERVICE-COMMERCE' };
      const mockResult: Role[] = [
        {
          _id: '65e1bbe2f76439ad4fcafb68',
          roleId: 'SERVICE_COMMERCE_PARTNER_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_PARTNER_PERMISSION'],
          displayName: 'Service Commerce PARTNER Admin',
        } as any,
        {
          _id: '65e1bbe2f76439ad4fcafb6q',
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
          displayName: 'Service Commerce Agency Admin',
        } as any,
      ];

      roleRepoMock.findByQuery = jest.fn().mockResolvedValue(mockResult);

      const result = await rolesService.findRoleByQuery(query);

      expect(roleRepoMock.findByQuery).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });
});
