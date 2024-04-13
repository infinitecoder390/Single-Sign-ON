import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationServiceController } from './controller';
import { AuthorizationService } from './service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { LoggerService } from './logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { CreateAuthAccessTokenDto } from './dto/auth-access-token.dto';
import { CreateAuthRefreshTokenDto } from './dto/auth-refresh-token.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { CommonMethods } from '@app/common/common-utils/common-methods';
import { BadRequestException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { from } from 'rxjs';
import { CheckAuthDto } from './dto/check-auth.dto';
import { AuthAuditService } from './service/auth-audit.service';
import { AuthAuditRepo } from './repository/auth-audit.repo';
import { CreateAuthAuditDto } from './dto/auth-audit.dto';
import { RolesService } from './service/roles.service';
import { RestServiceModule } from '@app/common/rest-service/rest-service.module';
import { RoleRepo } from './repository/roles.repo';
import { getModelToken } from '@nestjs/mongoose';
import { PermissionService } from './service/permission.service';
import { UserRoleService } from './service/user-role.service';
import { UserRoleRepo } from './repository/user-role.repo';
import { PermissionRepo } from './repository/permission.repo';
import { CreateRoleDto } from './dto/roles.dto';
import { DbType } from './utils/application-contants';
import { RestService } from '@app/common/rest-service/rest.service';
const GIGA_PROFILE_ENDPOINT: string = 'http://example-url.com';
describe('AuthorizationServiceController', () => {
  let authorizationServiceController: AuthorizationServiceController;
  let authenticationService: ClientProxy;
  let adminService: ClientProxy;
  let jwtService: JwtService;
  let authAccessTokenService: AuthAccessTokenService;
  let modelMock: any;
  let restService: RestService;
  beforeEach(async () => {
    modelMock = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
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
      controllers: [AuthorizationServiceController],
      providers: [
        AuthorizationService,
        AuthRefreshTokenService,
        AuthAccessTokenService,
        JwtService,
        LoggerService,
        RolesService,
        RoleRepo,
        {
          provide: getModelToken('RoleSchema'),
          useValue: modelMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return '123';
              }
              if (key === 'GIGA_PROFILE_ENDPOINT') {
                return GIGA_PROFILE_ENDPOINT;
              }
              return null;
            }),
          },
        },
        {
          provide: AuthAccessTokenRepo,
          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(createAuthAccessTokenDto)),
            create: jest.fn(() => Promise.resolve(createAuthAccessTokenDto)),
            getAccessToken: jest.fn(() => Promise.resolve('123456')),
            deleteUserAccessToken: jest.fn(() => Promise.resolve(true)),
            deleteUsersAccessToken: jest.fn(() => Promise.resolve(true)),
          }),
        },
        {
          provide: UserRoleRepo,
          useFactory: () => ({
            getUserRoleDetails: jest.fn(() => Promise.resolve(userRoleDetails)),
          }),
        },
        {
          provide: AuthRefreshTokenRepo,
          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(createAuthRefreshTokenDto)),
            create: jest.fn(() => Promise.resolve(createAuthRefreshTokenDto)),
            deleteUserRefreshToken: jest.fn(() => Promise.resolve(true)),
            deleteUsersRefreshToken: jest.fn(() => Promise.resolve(true)),
          }),
        },
        AuthAuditService,
        {
          provide: AuthAuditRepo,
          useFactory: () => ({
            create: jest.fn(() => Promise.resolve(createAuthAuditDto)),
          }),
        },
        PermissionService,
        UserRoleService,
        {
          provide: UserRoleService,
          useValue: {
            groupByUsers: jest.fn(() =>
              Promise.resolve([
                {
                  roleName: 'USER ROLE 01',
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
                  roleName: 'USER ROLE 02',
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
              ]),
            ),
            createOrUpdateUserRoles: jest.fn(),
            deleteUserRoleByQuery: jest.fn(),
          },
        },
        UserRoleRepo,
        {
          provide: UserRoleRepo,
          useFactory: () => ({
            findRolesByUserId: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '07891389-02a9-4a18-9e71-d73d12e6d2ab',
                  permissionEntity: {
                    agencyId: 'ac62365c-e4d4-4f32-b2cd-4f4c43ebde62',
                    userHash: '4203926df9de9912209d221bb3f77b3f',
                  },
                  userHash: '4203926df9de9912209d221bb3f77b3f',
                  roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                },
              ]),
            ),
            findAllUserRoles: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '07891389-02a9-4a18-9e71-d73d12e6d2ab',
                  permissionEntity: {
                    agencyId: 'ac62365c-e4d4-4f32-b2cd-4f4c43ebde62',
                    userHash: '4203926df9de9912209d221bb3f77b3f',
                  },
                  userHash: '4203926df9de9912209d221bb3f77b3f',
                  roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                },
              ]),
            ),
            upsertUser: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '1111111111111111111111111111111111',
                  roleId: 'USER_ROLE_01',
                  platformName: 'SERVICE-COMMERCE',
                  userHash: 'strin11223344',
                  permissionEntity: {
                    agencyId: 'agency-11223344',
                  },
                },
                {
                  _id: '22222222222222222222222222222222222222222222222',
                  roleId: 'USER_ROLE_02',
                  platformName: 'SERVICE-COMMERCE',
                  userHash: 'strin223344224455',
                  permissionEntity: {
                    agencyId: 'agency-2233445566',
                  },
                },
              ]),
            ),
            deleteByQuery: jest.fn(() =>
              Promise.resolve({
                _id: 'userrole01122332244',
              }),
            ),
            getAllUserRolesByPlatform: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '1111111111111111111111111111111111',
                  roleId: 'USER_ROLE_01',
                  platformName: 'SERVICE-COMMERCE',
                  userHash: 'strin11223344',
                  permissionEntity: {
                    agencyId: 'agency-11223344',
                  },
                },
                {
                  _id: '22222222222222222222222222222222222222222222222',
                  roleId: 'USER_ROLE_02',
                  platformName: 'SERVICE-COMMERCE',
                  userHash: 'strin223344224455',
                  permissionEntity: {
                    agencyId: 'agency-2233445566',
                  },
                },
              ]),
            ),
          }),
        },
        PermissionRepo,
        {
          provide: PermissionRepo,
          useFactory: () => ({
            findPermissionsByIds: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '65e1c299f76439ad4fcafb6a',
                  displayName: 'SERVICE COMMERCE AGENCY PERMISSION',
                  permissionId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                  scopes: [
                    'ALL::/api/service-commerce/agency/${agencyId}/*',
                    'GET::/api/service-commerce/agency/${agencyId}/profile/${userHash}/*',
                  ],
                  feScopes: [
                    'SERVICE-COMMERCE::agency-${agencyId}',
                    'SERVICE-COMMERCE::userHash-${userHash}',
                  ],
                },
              ]),
            ),
            findAllpermission: jest.fn(() => Promise.resolve([])),
          }),
        },
        RolesService,
        {
          provide: RoleRepo,
          useFactory: () => ({
            findRolesByIds: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '65e1bbe2f76439ad4fcafb68',
                  roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                  permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
                  displayName: 'Service Commerce Agency Admin',
                },
              ]),
            ),
            findByQuery: jest.fn(() =>
              Promise.resolve([
                {
                  _id: '65e1bbe2f76439ad4fcafb68',
                  roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                  platformName: 'SERVICE-COMMERCE',
                  permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
                  displayName: 'Service Commerce Agency Admin',
                },
              ]),
            ),
            createRole: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(() =>
              Promise.resolve({
                _id: '65e1bbe2f76439ad4fcafb68',
                roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
                platformName: 'SERVICE-COMMERCE',
                permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
                displayName: 'Service Commerce Agency Admin',
              }),
            ),
          }),
        },
      ],
    }).compile();

    authorizationServiceController = app.get<AuthorizationServiceController>(
      AuthorizationServiceController,
    );
    restService = app.get<RestService>(RestService);
    authenticationService = app.get<ClientProxy>('AUTHENTICATION_SERVICE');
    adminService = app.get<ClientProxy>('ADMIN_SERVICE');
    jwtService = app.get<JwtService>(JwtService);
    authAccessTokenService = app.get<AuthAccessTokenService>(
      AuthAccessTokenService,
    );
  });
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authorizationServiceController.getHello()).toBe('Hello World!');
    });

    it('Generate access token and refresh token, AuthCode not present', async () => {
      loginRequestDto.authCode = null;
      await expect(
        authorizationServiceController.accessToken('123456', loginRequestDto),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019')),
      );
    });

    it('Generate access token and refresh token, Empty pcke', async () => {
      const clientId = '123456';
      const response: any = Promise.resolve(null);
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      loginRequestDto.authCode = 'auth_code';
      await expect(
        authorizationServiceController.accessToken(clientId, loginRequestDto),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019')),
      );
    });

    it('gives the user role details from userhash', async () => {
      const response: any = Promise.resolve(null);
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      const userdata =
        await authorizationServiceController.getUserRoleByUserHash({
          userHash: 'de5fea1b-3bf4-41fe-8918-f30d5f534673',
          platform: 'SXP',
        });

      await expect(userdata.data).toEqual([userRoleDetails]);
    });

    it('gives the user role details from array of userHash', async () => {
      const response: any = Promise.resolve(null);
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);

      const userdata = await authorizationServiceController.bulkFetchUserRoles({
        key: 'userHash',
        data: ['4203926df9de9912209d221bb3f77b3f'],
        selectedFields: ['roleId'],
      });

      await expect(userdata.data).toEqual([userRoleDetails]);
    });

    it('Generate access token and refresh token, CodeVerifier not present', async () => {
      const clientId = '123456';
      const response: any = Promise.resolve({
        codeChallenge: 'codeVerifier',
        phone: '112',
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      loginRequestDto.authCode = 'auth_code';
      loginRequestDto.codeVerifier = null;
      await expect(
        authorizationServiceController.accessToken(clientId, loginRequestDto),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1022')),
      );
    });

    it('Generate access token and refresh token, Invalid CodeVerifier', async () => {
      const clientId = '123456';
      const response: any = Promise.resolve({
        codeChallenge: 'codeVerifier',
        phone: '112',
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      loginRequestDto.codeVerifier = 'codeVerifier';
      await expect(
        authorizationServiceController.accessToken(clientId, loginRequestDto),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1020')),
      );
    });

    it('Generate access token and refresh token, AuthCode is expired', async () => {
      const clientId = '123456';
      const response: any = Promise.resolve({
        codeChallenge: 'codeVerifier',
        phone: '112',
        expiryDateTime: Date.now() - 1000,
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      loginRequestDto.codeVerifier = 'codeVerifier';
      await expect(
        authorizationServiceController.accessToken(clientId, loginRequestDto),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1024')),
      );
    });

    it('Generate access token and refresh token', async () => {
      const clientId = '123456';
      const response: any = Promise.resolve({
        codeChallenge: 'N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928',
        phone: '112',
        accessTokenExpiry: 500,
        refreshTokenExpiry: 5000,
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      jest.spyOn(adminService, 'send').mockReturnValue(observableResponse);
      loginRequestDto.authCode = 'auth_code';
      const result = await authorizationServiceController.accessToken(
        clientId,
        loginRequestDto,
      );
      expect(result.message).toEqual(
        'Access and Refresh token generated successfuly.',
      );
    });

    it('Generate access token and refresh token When user  is giga-profile user and has countryCode and phone', async () => {
      const clientId = 'TCG-CLIENT-ID';
      const queryString = 'phone=8552049006&countryCode=91&quadrant=profile';
      const response: any = Promise.resolve({
        codeChallenge: 'N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928',
        phone: '8552049006',
        accessTokenExpiry: 500,
        refreshTokenExpiry: 5000,
        userdb: DbType.GIGA_PROFILE,
        countryCode: '91',
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      jest.spyOn(restService, 'get').mockResolvedValue({
        data: {
          items: {
            _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',
            profile: {
              phone: '8552049006',
              countryCode: '91',
            },
          },
        },
      });
      const result = await authorizationServiceController.accessToken(
        clientId,
        loginRequestDto,
      );
      expect(restService.get).toBeCalledTimes(1);
      expect(restService.get).toBeCalledWith(
        `${GIGA_PROFILE_ENDPOINT}/giga-profile/v1/check-user?${queryString}`,
      );
      expect(result.message).toEqual(
        'Access and Refresh token generated successfuly.',
      );
    });
    it('Generate access token and refresh token When user is giga-profile user and has email', async () => {
      const clientId = 'TCG-CLIENT-ID';
      const queryString = 'email=admin@gmail.com&quadrant=profile';
      const response: any = Promise.resolve({
        codeChallenge: 'N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928',
        email: 'admin@gmail.com',
        accessTokenExpiry: 500,
        refreshTokenExpiry: 5000,
        userdb: DbType.GIGA_PROFILE,
      });
      const observableResponse = from(response);
      jest
        .spyOn(authenticationService, 'send')
        .mockReturnValue(observableResponse);
      jest.spyOn(restService, 'get').mockResolvedValue({
        data: {
          items: {
            _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',
            profile: {
              email: 'admin@gmail.com',
            },
          },
        },
      });
      const result = await authorizationServiceController.accessToken(
        clientId,
        loginRequestDto,
      );
      expect(restService.get).toBeCalledTimes(1);
      expect(restService.get).toBeCalledWith(
        `${GIGA_PROFILE_ENDPOINT}/giga-profile/v1/check-user?${queryString}`,
      );
      expect(result.message).toEqual(
        'Access and Refresh token generated successfuly.',
      );
    });

    it('Check Authorization, Invalid Access Token', async () => {
      await expect(
        authorizationServiceController.checkAuthorization(checkAuthDto),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1073')),
      );
    });

    it('Check Authorization,with no scopes', async () => {
      const decoded: any = {};
      jest.spyOn(jwtService, 'verify').mockReturnValue(decoded);
      await expect(
        authorizationServiceController.checkAuthorization(checkAuthDto),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1074')),
      );
    });

    it('Check Authorization,with scopes', async () => {
      const decoded: any = {
        scopes: ['ALL::.*/api/dxp/.*'],
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue(decoded);
      const result =
        await authorizationServiceController.checkAuthorization(checkAuthDto);
      expect(result).toHaveProperty('scopes');
    });

    it('deleteUserSessionDetails,success', async () => {
      const userId: string = '123456';
      const result =
        await authorizationServiceController.deleteUserSessionDetails(userId);
      expect(result).toEqual(true);
    });

    it('deleteUserSessionDetails,fail', async () => {
      const userId: string = '123456';
      const response: any = false;
      jest
        .spyOn(authAccessTokenService, 'deleteUserAccessToken')
        .mockReturnValue(response);
      const result =
        await authorizationServiceController.deleteUserSessionDetails(userId);
      expect(result).toEqual(false);
    });

    it('deleteUserSessionDetails,error', async () => {
      const userId: string = '123456';
      const response: any = new RpcException(
        CommonMethods.getSsoErrorMsg('SSO_1071'),
      );
      jest
        .spyOn(authAccessTokenService, 'deleteUserAccessToken')
        .mockRejectedValue(response);
      await expect(
        authorizationServiceController.deleteUserSessionDetails(userId),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1071')),
      );
    });

    it('deleteUserSessionDetails,User id is null', async () => {
      const userId: string = null;
      await expect(
        authorizationServiceController.deleteUserSessionDetails(userId),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1077')),
      );
    });

    it('deleteUsersSessionDetails,success', async () => {
      const userIds: string[] = ['123456', '7890123'];
      const result =
        await authorizationServiceController.deleteUsersSessionDetails(userIds);
      expect(result).toEqual(true);
    });

    it('deleteUsersSessionDetails,fail', async () => {
      const userIds: string[] = ['123456', '7890123'];
      const response: any = false;
      jest
        .spyOn(authAccessTokenService, 'deleteUsersAccessToken')
        .mockReturnValue(response);
      const result =
        await authorizationServiceController.deleteUsersSessionDetails(userIds);
      expect(result).toEqual(false);
    });

    it('deleteUsersSessionDetails,error', async () => {
      const userIds: string[] = ['123456', '7890123'];
      const response: any = new RpcException(
        CommonMethods.getSsoErrorMsg('SSO_1071'),
      );
      jest
        .spyOn(authAccessTokenService, 'deleteUsersAccessToken')
        .mockRejectedValue(response);
      await expect(
        authorizationServiceController.deleteUsersSessionDetails(userIds),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1071')),
      );
    });

    it('deleteUsersSessionDetails,User ids is null', async () => {
      const userIds: string[] = [];
      await expect(
        authorizationServiceController.deleteUsersSessionDetails(userIds),
      ).rejects.toThrow(
        new RpcException(CommonMethods.getSsoErrorMsg('SSO_1077')),
      );
    });
  });
  describe('#groupBypermission', () => {
    it('Should call with groupPermission function and platformName + groupBy value', async () => {
      const platformName = 'SERVICE-COMMERCE';
      const groupByValue = 'permissionGroup';
      const result = await authorizationServiceController.groupPermission(
        platformName,
        groupByValue,
      );
      expect(result.message).toEqual('Permission fetched successfully.');
    });
  });
  describe('#roles', () => {
    it('Should call with findRoles function and platformName + query value and find result which will returned filter data', async () => {
      const platformName = 'SERVICE-COMMERCE';
      const query = {
        roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
      };
      const result = await authorizationServiceController.findRoles(
        query,
        platformName,
      );
      expect(result.message).toEqual('Roles fetched successfully.');
    });
    it('Should call with createRole function and platformName + CreateRoleDto .. it will return error because already has roleId', async () => {
      try {
        const createRoleDto: CreateRoleDto = {
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          isAdmin: false,
          isDefault: false,
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        };
        await authorizationServiceController.createRole(createRoleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(CommonMethods.getSsoErrorMsg('SSO_1085'));
      }
    });
    it('Should call with updateRole function and platformName + Partial<CreateRoleDto> .. it will return an Error', async () => {
      try {
        const createRoleDto: CreateRoleDto = {
          roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
          isAdmin: false,
          isDefault: false,
          platformName: 'SERVICE-COMMERCE',
          permissionIds: ['SERVICE_COMMERCE_AGENCY_PERMISSION'],
        };
        await authorizationServiceController.updateRole(
          '11223344',
          createRoleDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('Should call with deleteRole function and platformName + _id .. it will get resove response and delete role', async () => {
      const result = await authorizationServiceController.deleteRole(
        '65e1bbe2f76439ad4fcafb68',
      );
      expect(result.message).toEqual('Role Deleted successfully.');
    });
  });
  describe('#user-roles', () => {
    it('should create bulk user-roles', async () => {
      const result = await authorizationServiceController.bulkUploadUserRole([
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
      ]);
      expect(result.message).toEqual('User roles created successfully.');
    });
    it('should run deleteUserRoleByQuery function and delete user-roles', async () => {
      const result = await authorizationServiceController.deleteUserRoleByQuery(
        { _id: 'userrole01122332244' },
      );
      expect(result.message).toEqual('Role Deleted successfully.');
    });
    it('should run groupUsers function and get list of users group based on role and userRole', async () => {
      const platformName = 'SERVICE-COMMERCE';
      const result = await authorizationServiceController.groupUsers(
        platformName,
        'roleId',
      );
      expect(result.message).toEqual('Users fetched successfully.');
    });
  });
});

const createAuthAccessTokenDto = new CreateAuthAccessTokenDto();
createAuthAccessTokenDto._id = '123456';
createAuthAccessTokenDto.clientId = '123456';
createAuthAccessTokenDto.refreshTokenId = '123456';
createAuthAccessTokenDto.userId = '123456';

const createAuthRefreshTokenDto = new CreateAuthRefreshTokenDto();
createAuthRefreshTokenDto._id = '123456';
createAuthRefreshTokenDto.clientId = '123456';
createAuthRefreshTokenDto.userId = '123456';

const loginRequestDto = new LoginRequestDto();
loginRequestDto.authCode = 'auth_code';
loginRequestDto.email = 'test@test.com';
loginRequestDto.phone = '1234567890';
loginRequestDto.codeVerifier = 'N1E4yRMD7xixn_oFyO_W3htYN3rY7-HMDKJe6z6r928';

const checkAuthDto = new CheckAuthDto();
checkAuthDto.apiEndPoint = '4001/api/dxp/organisations';
checkAuthDto.host = 'localhost';
checkAuthDto.httpMethod = 'POST';
checkAuthDto.protocol = 'TCP';
checkAuthDto.jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MmU2MDE4NWI0ZWRmMTc3YzNmNGE2YWU3ODg5Zjk3N2M1MWE4MjQxYTdkOTUwYzAxM2Q5YWFhMGUxNjI0MmYxIiwianRpIjoiZGE3ZTQ0MTUtMzg2Yi00ZThiLTkyNDMtM2Y4OGE0NzlkYmI0IiwiaXNzIjoiaHR0cHM6Ly9hcGkudGNncmUuY29tL2FwaS9zc28vYXV0aCIsImF1ZCI6Imh0dHBzOi8vYXBpLnRjZ3JlLmNvbSAvYXBpIiwic2NvcGVzIjpbIkFMTDo6LiovYXBpL2R4cC8uKiJdLCJpYXQiOjE2OTc2MDcwODgsImV4cCI6MTY5NzY5MzQ4OH0.ksS6fR3JEKLE3IA2tg5F98-LneYdqf5KQg9g7Fk8Zhg';

const createAuthAuditDto = new CreateAuthAuditDto();
createAuthAuditDto.clientId = '123456';
createAuthAuditDto.userId = '123456';

const userRoleDetails = {
  _id: '07891389-02a9-4a18-9e71-d73d12e6d2ab',
  permissionEntity: {
    agencyId: 'ac62365c-e4d4-4f32-b2cd-4f4c43ebde62',
    userHash: '4203926df9de9912209d221bb3f77b3f',
  },
  userHash: '4203926df9de9912209d221bb3f77b3f',
  roleId: 'SERVICE_COMMERCE_AGENCY_PERMISSION',
  platformName: 'SERVICE-COMMERCE',
};
