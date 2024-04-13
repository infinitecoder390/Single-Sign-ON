import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthAuditService } from './service/auth-audit.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PermissionService } from './service/permission.service';
import { UserRoleService } from './service/user-role.service';
import { RolesService } from './service/roles.service';
import { UserRoleRepo } from './repository/user-role.repo';
import { RoleRepo } from './repository/roles.repo';
import { PermissionRepo } from './repository/permission.repo';
import { LoggerService } from './logger/logger.service';
import { RestServiceModule } from '@app/common/rest-service/rest-service.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { AuthAuditRepo } from './repository/auth-audit.repo';
import { getModelToken } from '@nestjs/mongoose';
import { UserRole } from './schema/user-role.schema';
import { Role } from './schema/roles.schema';
import { Permission } from './schema/permission.schema';
import { AuthRefreshToken } from './schema/auth-refresh-token.schema';
import { AuthAccessToken } from './schema/auth-access-token.schema';
import { AuthAudit } from './schema/auth-audit.schema';
import { BadRequestException } from '@nestjs/common';
describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let roleService: RolesService;
  let userRoleService: UserRoleService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RestServiceModule,
        ClientsModule.register([
          {
            name: 'AUTHENTICATION_SERVICE',
            transport: Transport.TCP,
          },
          {
            name: 'ADMIN_SERVICE',
            transport: Transport.TCP,
          },
        ]),
      ],
      providers: [
        AuthorizationService,
        LoggerService,
        AuthRefreshTokenService,
        AuthAccessTokenService,
        AuthAuditService,
        JwtService,
        ConfigService,
        PermissionService,
        RolesService,
        UserRoleService,
        UserRoleRepo,
        PermissionRepo,
        RoleRepo,
        AuthRefreshTokenRepo,
        AuthAccessTokenRepo,
        AuthAuditRepo,
        {
          provide: getModelToken(UserRole.name),
          useValue: {},
        },
        {
          provide: getModelToken(Role.name),
          useValue: {},
        },
        {
          provide: getModelToken(Permission.name),
          useValue: {
            find: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '65e1c299f76439ad4fcafb6a',
                  displayName: 'SERVICE COMMERCE AGENCY PERMISSION',
                  permissionId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                  permissionGroup: 'Service agency permissions',
                  scopes: [
                    'ALL::/api/service-commerce/agency/${agencyId}/*',
                    'GET::/api/service-commerce/agency/${agencyId}/profile/${userHash}/*',
                  ],
                  feScopes: [
                    'SERVICE-COMMERCE::agency-${agencyId}',
                    'SERVICE-COMMERCE::userHash-${userHash}',
                  ],
                },
                {
                  _id: '65e1c299f76439ad4fcafb22',
                  displayName: 'SERVICE COMMERCE PARTNER PERMISSION',
                  permissionId: 'SERVICE_COMMERCE_PARTNER_PERMISSION',
                  permissionGroup: 'Service Partner permissions',
                  platformName: 'SERVICE-COMMERCE',
                  scopes: [
                    'ALL::/api/service-commerce/partner/${partnerId}/*',
                    'GET::/api/service-commerce/partner/${partnerId}/profile/${userHash}/*',
                  ],
                  feScopes: [
                    'SERVICE-COMMERCE::partner-${partnerId}',
                    'SERVICE-COMMERCE::userHash-${userHash}',
                  ],
                },
              ]),
            ),
          },
        },
        {
          provide: getModelToken(AuthRefreshToken.name),
          useValue: {},
        },
        {
          provide: getModelToken(AuthAccessToken.name),
          useValue: {},
        },
        {
          provide: getModelToken(AuthAudit.name),
          useValue: {},
        },
      ],
    }).compile();
    service = module.get<AuthorizationService>(AuthorizationService);
    roleService = module.get<RolesService>(RolesService);
    userRoleService = module.get<UserRoleService>(UserRoleService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('#groupByPermissions', () => {
    it('should call permissionService.groupByAllPermission and return the result', async () => {
      const mockResult = [
        {
          permissionGroup: 'Service agency permissions',
          items: [
            {
              _id: '65e1c299f76439ad4fcafb6a',
              displayName: 'SERVICE COMMERCE AGENCY PERMISSION',
              permissionId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
              platformName: 'SERVICE-COMMERCE',
              permissionGroup: 'Service agency permissions',
              scopes: [
                'ALL::/api/service-commerce/agency/${agencyId}/*',
                'GET::/api/service-commerce/agency/${agencyId}/profile/${userHash}/*',
              ],
              feScopes: [
                'SERVICE-COMMERCE::agency-${agencyId}',
                'SERVICE-COMMERCE::userHash-${userHash}',
              ],
            },
          ],
        },
        {
          permissionGroup: 'Service Partner permissions',
          items: [
            {
              _id: '65e1c299f76439ad4fcafb22',
              displayName: 'SERVICE COMMERCE PARTNER PERMISSION',
              permissionId: 'SERVICE_COMMERCE_PARTNER_PERMISSION',
              permissionGroup: 'Service Partner permissions',
              platformName: 'SERVICE-COMMERCE',
              scopes: [
                'ALL::/api/service-commerce/partner/${partnerId}/*',
                'GET::/api/service-commerce/partner/${partnerId}/profile/${userHash}/*',
              ],
              feScopes: [
                'SERVICE-COMMERCE::partner-${partnerId}',
                'SERVICE-COMMERCE::userHash-${userHash}',
              ],
            },
          ],
        },
      ];
      const plateformName = 'SERVICE-COMMERCE';
      const groupBy = 'permissionGroup';
      const result = await service.groupByPermissions(groupBy, plateformName);
      expect(result).toEqual(mockResult);
    });
  });
  describe('#findAllRoles', () => {
    it('should call roleService.findRoleByQuery with correct parameters and return the result', async () => {
      const platformName = 'SERVICE-COMMERCE';
      const query = {
        platformName: 'SERVICE-COMMERCE',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
      };
      const mockResult = [
        {
          _id: '65e1bbe2f76439ad4fcafb68',
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
          displayName: 'Service Commerce Agency Admin',
        },
      ];
      roleService.findRoleByQuery = jest.fn().mockResolvedValue(mockResult);
      const result = await service.findAllRoles(query, platformName);
      expect(roleService.findRoleByQuery).toHaveBeenCalledWith({
        ...query,
        platformName,
      });
      expect(result).toEqual(mockResult);
    });

    it('should call roleService.findRoleByQuery with only platformName if query is falsy', async () => {
      const platformName = 'yourPlatformName';
      const mockResult = [];
      roleService.findRoleByQuery = jest.fn().mockResolvedValue(mockResult);
      const result = await service.findAllRoles(null, platformName);
      expect(roleService.findRoleByQuery).toHaveBeenCalledWith({
        platformName,
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException if roleService.findRoleByQuery throws an error', async () => {
      roleService.findRoleByQuery = jest
        .fn()
        .mockRejectedValue(new Error('Some error'));

      await expect(
        service.findAllRoles({}, 'service-commerce'),
      ).rejects.toThrowError(BadRequestException);
    });
  });
  describe('#createRole', () => {
    it('should call roleService.createRole with correct parameters and return the result', async () => {
      const createRoleDto = {
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        isAdmin: false,
        isDefault: false,
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
      };
      const mockResult = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        displayName: 'Service Commerce Agency Admin',
      };
      roleService.createRole = jest.fn().mockResolvedValue(mockResult);
      const result = await service.createRole(createRoleDto);
      expect(roleService.createRole).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockResult);
    });
  });
  describe('#updateRole', () => {
    it('should call roleService.updateRoleById with correct parameters and return the result', async () => {
      const roleId = '65e1bbe2f76439ad4fcafb68';
      const updateRoleDto = {
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: [
          'SERVICE_COMMERCE_AGENCY_PERMISSION',
          'SERVICE_COMMERCE_PARTNER_PERMISSION',
        ],
      };
      const mockResult = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: [
          'SERVICE_COMMERCE_AGENCY_PERMISSION',
          'SERVICE_COMMERCE_PARTNER_PERMISSION',
        ],
        displayName: 'Service Commerce Agency Admin',
      };

      roleService.updateRoleById = jest.fn().mockResolvedValue(mockResult);

      const result = await service.updateRole(roleId, updateRoleDto);

      expect(roleService.updateRoleById).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(mockResult);
    });
  });
  describe('#deleteRole', () => {
    it('should call roleService.deleteRoleById with correct parameters and return the result', async () => {
      const roleId = '65e1bbe2f76439ad4fcafb68';
      const mockResult = {
        _id: '65e1bbe2f76439ad4fcafb68',
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
        platformName: 'SERVICE-COMMERCE',
        permissionIds: [
          'SERVICE_COMMERCE_AGENCY_PERMISSION',
          'SERVICE_COMMERCE_PARTNER_PERMISSION',
        ],
        displayName: 'Service Commerce Agency Admin',
      };
      roleService.deleteRoleById = jest.fn().mockResolvedValue(mockResult);
      const result = await service.deleteRole(roleId);
      expect(roleService.deleteRoleById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockResult);
    });
  });
  describe('#bulkUploadUserRoles', () => {
    it('should call userRoleService.createOrUpdateUserRoles with correct parameters and return the result', async () => {
      const createUserRoleDto = [
        {
          roleId: 'USER_ROLE_01',
          platformName: 'SERVICE-COMMERCE',
          userHash: 'strin11223344',
          permissionEntity: {
            agencyId: 'agency-11223344',
          },
        },
        {
          roleId: 'USER_ROLE_02',
          platformName: 'SERVICE-COMMERCE',
          userHash: 'strin223344224455',
          permissionEntity: {
            agencyId: 'agency-2233445566',
          },
        },
      ];
      const mockResult = [
        {
          id: 'u1223344',
          roleId: 'USER_ROLE_01',
          platformName: 'SERVICE-COMMERCE',
          userHash: 'strin11223344',
          permissionEntity: {
            agencyId: 'agency-11223344',
          },
        },
        {
          id: 'u122334422111',
          roleId: 'USER_ROLE_02',
          platformName: 'SERVICE-COMMERCE',
          userHash: 'strin223344224455',
          permissionEntity: {
            agencyId: 'agency-2233445566',
          },
        },
      ];

      userRoleService.createOrUpdateUserRoles = jest
        .fn()
        .mockResolvedValue(mockResult);

      const result = await service.bulkUploadUserRoles(createUserRoleDto);

      expect(userRoleService.createOrUpdateUserRoles).toHaveBeenCalledWith(
        createUserRoleDto,
      );
      expect(result).toEqual(mockResult);
    });
  });
  describe('deleteUserRoleByRoleId', () => {
    it('should call userRoleService.deleteUserRoleByQuery with correct parameters and return the result', async () => {
      const query = {
        _id: '122332',
      };
      const mockResult = {
        _id: '122332',
        roleId: 'USER_ROLE_01',
        platformName: 'SERVICE-COMMERCE',
        userHash: 'strin11223344',
        permissionEntity: {
          agencyId: 'agency-11223344',
        },
      };
      userRoleService.deleteUserRoleByQuery = jest
        .fn()
        .mockResolvedValue(mockResult);
      const result = await service.deleteUserRoleByRoleId(query);
      expect(userRoleService.deleteUserRoleByQuery).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });
  describe('#groupByUsers', () => {
    it('should call userRoleService.groupByUsers with correct parameters and return the result', async () => {
      const platformName = 'yourPlatformName';
      const groupBy = 'yourGroupBy';
      const mockResult = [
        {
          roleName: 'Service Commerce Agency Admin',
          items: [
            {
              _id: '4203926df9de9912209d221bb3f77b3f',
              profile: {
                firstName: 'Akshay',
                lastName: 'naik',
                phone: '7887680326',
                countryCode: '91',
                email: 'amit.shah@fhc.com',
                userIdentifications: {
                  aadhar: {
                    idNo: 'xxxxxxxx4523',
                  },
                  pan: {
                    idNo: 'AFZPK7190K',
                  },
                },
                deviceTokens: [],
              },
              createdAt: '2024-03-01T11:33:17.458Z',
              updatedAt: '2024-03-01T11:33:17.458Z',
              isActive: true,
              userHash: '4203926df9de9912209d221bb3f77b3f',
              __v: 0,
            },
          ],
        },
        {
          roleName: 'Service Commerce Partner',
          items: [
            {
              _id: '3844ef3b5487e4a5144215e39e4cbd63',
              profile: {
                firstName: 'Sidhesh',
                lastName: 'Parab',
                phone: '8237407409',
                countryCode: '91',
                workAddress: {
                  area: 'A1, Chandravarsha compound, Pashan, Nashik,Marol',
                  city: 'Mumbai',
                  state: 'Maharashtra',
                  pincode: 400047,
                  _id: '65e34150bb6df880f8c1f75f',
                },
                profilePicture: 'photo@web.com',
                userIdentifications: {
                  aadhar: {
                    idNo: 'xxxxxxxx9012',
                    docUrl: 'aadhar@web.com',
                  },
                  pan: {
                    idNo: 'FSICP7577F',
                    docUrl: 'http//:edgyjgdww68768ebdjhca87t68',
                  },
                },
                deviceTokens: [],
              },
              application: {
                serviceCommerce: {
                  serviceCommercePartnerApp: {
                    serviceCommercePartnerId: 'SP000000021',
                    serviceCommercePartnerOnboardingDate:
                      '2023-12-12T00:00:00.000Z',
                    serviceCommercePartnerType: 'Partner',
                  },
                },
              },
              createdAt: '2024-03-02T15:10:08.878Z',
              updatedAt: '2024-03-02T15:10:08.878Z',
              isActive: true,
              userHash: '3844ef3b5487e4a5144215e39e4cbd63',
              __v: 0,
            },
          ],
        },
      ];
      userRoleService.groupByUsers = jest.fn().mockResolvedValue(mockResult);
      const result = await service.groupByUsers(platformName, groupBy);
      expect(userRoleService.groupByUsers).toHaveBeenCalledWith(
        platformName,
        groupBy,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
