import { Test } from '@nestjs/testing';
import { UserRoleRepo } from '../repository/user-role.repo';
import { RolesService } from '../service/roles.service';
import { BulkUserService } from './bulk-user.service';

describe('Bulk user service', () => {
  let service: BulkUserService;
  let userRepoMock: Partial<UserRoleRepo>;
  let rolesServiceMock: Partial<RolesService>;

  beforeEach(async () => {
    // Mock UserRepo methods
    userRepoMock = {
      upsertUser: jest.fn().mockImplementation(async (dtos) => dtos),
    };

    // Mock RolesService methods
    rolesServiceMock = {
      findRolesByIds: jest
        .fn()
        .mockImplementation(async () => [
          { roleId: 'society-admin', clientName: 'sxp' },
        ]),
    };

    const module = await Test.createTestingModule({
      providers: [
        BulkUserService,
        {
          provide: UserRoleRepo,
          useValue: userRepoMock,
        },
        {
          provide: RolesService,
          useValue: rolesServiceMock,
        },
      ],
    }).compile();

    service = module.get<BulkUserService>(BulkUserService);
  });

  it('should create user', async () => {
    const bulkUserDto = [
      {
        permissionEntity: { societyId: 'ss1' },
        userHash: 'hash1',
        roleId: 'society-admin',
        platformName: 'SxP',
      },
      {
        permissionEntity: { societyId: 'ss2' },
        userHash: 'hash2',
        roleId: 'society-admin',
        platformName: 'SxP',
      },
    ];

    const result = await service.createBulkUserRole('clientId', bulkUserDto);
    expect(result).toBeDefined();
    expect(result.length).toEqual(bulkUserDto.length);
  });

  it('should skip invalid roles and create users for valid roles', async () => {
    const bulkUserDto = [
      {
        permissionEntity: { societyId: 'ss1' },
        userHash: 'hash1',
        roleId: 'invalid-role',
        platformName: 'SxP',
      },
      {
        permissionEntity: { societyId: 'ss2' },
        userHash: 'hash2',
        roleId: 'society-admin',
        platformName: 'SxP',
      },
    ];

    const result = await service.createBulkUserRole('clientId', bulkUserDto);

    expect(result).toBeDefined();

    // Only one user should be created for the valid role
    expect(result.length).toEqual(1);
    expect(userRepoMock.upsertUser).toHaveBeenCalledWith(expect.any(Array));
  });
});
