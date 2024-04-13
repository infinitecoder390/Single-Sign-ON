import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './service';

import { AuthClientRepo } from './repository/auth-client.repo';

import { AuthOtpDetailService } from './service/auth-otp-detail.service';

import { AuthPkceService } from './service/auth-pkce.service';

import { UserService } from './user/service/user.service';

import { AuthPkceRepo } from './repository/auth-pkce.repo';

import { RestServiceModule } from '@app/common/rest-service/rest-service.module';

import { AuthClientService } from './service/auth-client.service';

import { AuthAccessTokenService } from './service/auth-access-token.service';

import { AuthRefreshTokenService } from './service/auth-refresh-token.service';

import { JwtService } from '@nestjs/jwt';

import { LoggerService } from './logger/logger.service';

import { ConfigService } from '@nestjs/config';

import { UserRepo } from './user/repository/user.repo';

import { AuthOtpDetailRepo } from './repository/auth-otp-detail.repo';

import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';

import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';

import { RestService } from '@app/common/rest-service/rest.service';

import { CreateUserDto } from './user/dto/create-user.dto';

import { LoginRequestDto } from './dto/login-request.dto';

import { CreateAuthClientDto } from './dto/auth-client.dto';

import { CreateAuthOtpDetailDto } from './dto/auth-otp-detail.dto';

import { CreateAuthPkceDto } from './dto/auth-pkce.dto';

import { CreateAuthAccessTokenDto } from './dto/auth-access-token.dto';

import { CreateAuthRefreshTokenDto } from './dto/auth-refresh-token.dto';

import { BadRequestException } from '@nestjs/common';

import { DbType } from './utils/application-contants';

import { CommonMethods } from '@app/common/common-utils/common-methods';

const GIGA_PROFILE_ENDPOINT: string = 'http://example-url.com';

describe('AuthService', () => {
  let authClientRepo: AuthClientRepo;

  let authOtpDetailService: AuthOtpDetailService;

  let userService: UserService;

  let authService: AuthService;

  let restService: RestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RestServiceModule],

      providers: [
        AuthService,

        AuthClientService,

        AuthOtpDetailService,

        AuthAccessTokenService,

        AuthRefreshTokenService,

        AuthPkceService,

        JwtService,

        LoggerService,

        UserService,

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
          provide: UserRepo,

          useFactory: () => ({
            createUser: jest.fn(() => Promise.resolve(newUser)),

            findByEmail: jest.fn(() => Promise.resolve(dbUser)),

            findByPhone: jest.fn(() => Promise.resolve(dbUser)),

            saveUser: jest.fn(() => Promise.resolve(newUser)),
          }),
        },

        {
          provide: AuthClientRepo,

          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(client)),

            findByClientName: jest.fn(() => Promise.resolve(client)),
          }),
        },

        {
          provide: AuthOtpDetailRepo,

          useFactory: () => ({
            findByEmail: jest.fn(() => Promise.resolve(authOtpDetail)),

            findByPhone: jest.fn(() => Promise.resolve(authOtpDetail)),

            findByRefId: jest.fn(() => Promise.resolve(authOtpDetail)),

            create: jest.fn(() => Promise.resolve(authOtpDetail)),

            deleteById: jest.fn(() => Promise.resolve(authOtpDetail)),

            saveById: jest.fn(() => Promise.resolve(authOtpDetail)),
          }),
        },

        {
          provide: AuthPkceRepo,

          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(createAuthPkceDto)),

            create: jest.fn(() => Promise.resolve(createAuthPkceDto)),

            findByCode: jest.fn(() => Promise.resolve(createAuthPkceDto)),
          }),
        },

        {
          provide: AuthAccessTokenRepo,

          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(createAuthAccessTokenDto)),

            create: jest.fn(() => Promise.resolve(createAuthAccessTokenDto)),
          }),
        },

        {
          provide: AuthRefreshTokenRepo,

          useFactory: () => ({
            findById: jest.fn(() => Promise.resolve(createAuthRefreshTokenDto)),

            create: jest.fn(() => Promise.resolve(createAuthRefreshTokenDto)),
          }),
        },
      ],
    }).compile();

    authClientRepo = module.get<AuthClientRepo>(AuthClientRepo);

    authOtpDetailService =
      module.get<AuthOtpDetailService>(AuthOtpDetailService);

    userService = module.get<UserService>(UserService);

    authService = module.get<AuthService>(AuthService);

    restService = module.get<RestService>(RestService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('#getOtpSent', () => {
    it('should get OTP sent for GIGA_PROFILE', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',
        phone: '1234567890',
        countryCode: '91',
        ...loginRequestEmailDto,
      };
      const queryString = `phone=${loginRequestDto.phone}&countryCode=${loginRequestDto.countryCode}&email=${loginRequestDto.email}&quadrant=profile`;
      const clientId = 'TCG-Client-Id';
      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,
        ...client,
      };
      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);
      jest.spyOn(restService, 'get').mockResolvedValue({
        _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',
        profile: {
          phone: '1234567890',
          countryCode: '91',
          email: 'ad@gmail.com',
        },
      });
      authService.sendOtpToUser = jest
        .fn()
        .mockReturnValue({ refId: 'some-ref-id' });
      const result = await authService.getOtpSent(loginRequestDto, clientId);
      expect(result).toBeDefined();
      expect(restService.get).toBeCalledTimes(1);
      expect(restService.get).toBeCalledWith(
        `${GIGA_PROFILE_ENDPOINT}/giga-profile/v1/check-user?${queryString}`,
      );
    });

    it('should get OTP sent for non-GIGA_PROFILE', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',
        phone: '1234567890',
        countryCode: '91',
        ...loginRequestEmailDto,
      };
      const clientId = 'tcg-client-id';
      const authClientStore = {
        userdb: 'dxp',
        ...client,
      };
      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);
      userService.findByEmailOrPhone = jest.fn().mockReturnValue({
        email: 'test@example.com',
        phone: '1234567890',
        countryCode: '91',
      });
      const sendOtpToUserMock = (authService.sendOtpToUser = jest
        .fn()
        .mockReturnValue({ refId: 'some-ref-id' }));
      const result = await authService.getOtpSent(loginRequestDto, clientId);
      expect(result).toBeDefined();
      expect(sendOtpToUserMock).toHaveBeenCalledWith(
        expect.any(Object),
        loginRequestDto,
        authClientStore,
      );
    });

    it('should throw BadRequestException if user is not found', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'nonexistent@example.com',
        phone: '1234567890',
        countryCode: '91',
        ...loginRequestEmailDto,
      };
      const clientId = 'Tcg-Client-ID';
      const authClientStore = {
        userdb: 'dxp',
        ...client,
      };
      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);
      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(null);
      await expect(
        authService.getOtpSent(loginRequestDto, clientId),
      ).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException if user is not found in giga-profile db', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'nonexistent@example.com',
        phone: '1234567890',
        countryCode: '91',
        ...loginRequestEmailDto,
      };
      const clientId = 'Tcg-Client-ID';
      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,
        ...client,
      };
      const queryString = `phone=${loginRequestDto.phone}&countryCode=${loginRequestDto.countryCode}&email=${loginRequestDto.email}&quadrant=profile`;
      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);
      jest.spyOn(restService, 'get').mockReturnValue(null);
      await expect(
        authService.getOtpSent(loginRequestDto, clientId),
      ).rejects.toThrow(BadRequestException);
      expect(restService.get).toBeCalledTimes(1);
      expect(restService.get).toBeCalledWith(
        `${GIGA_PROFILE_ENDPOINT}/giga-profile/v1/check-user?${queryString}`,
      );
    });

    it('should construct query string with phone and countryCode', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: null,

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-CLIENT-ID';

      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      jest.spyOn(restService, 'get').mockResolvedValue({
        _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',

        profile: {
          phone: '1234567890',

          countryCode: '91',

          email: 'ad@gmail.com',
        },
      });

      const result = await authService.getOtpSent(loginRequestDto, clientId);

      expect(result).toBeDefined();
    });

    it('should construct query string with email', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: null,

        countryCode: null,

        ...loginRequestEmailDto,
      };

      const clientId = 'tcg-ops-id';

      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      jest.spyOn(restService, 'get').mockResolvedValue({
        _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',

        profile: {
          phone: '1234567890',

          countryCode: '91',

          email: 'test@example.com',
        },
      });

      const result = await authService.getOtpSent(loginRequestDto, clientId);

      expect(result).toBeDefined();
    });
  });

  describe('#verifyEmail', () => {
    it('should throw BadRequestException if OTP is blocked', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        ...client,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      jest.spyOn(authService, 'isOtpBlocked').mockReturnValue(true);

      await expect(
        authService.verifyEmail(loginRequestDto, clientId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP verification duration exceeds OTP expiry', async () => {
      authOtpDetail.verifyOtpAttempt = 3;

      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        ...client,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      await expect(
        authService.verifyEmail(loginRequestDto, clientId),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1016')),
      );
    });

    it('should throw BadRequestException if OTP is not verified and exired', async () => {
      authOtpDetail.lastGetOtpAttemptedInMillis = Date.now() - 6 * 60000;

      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        ...client,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      await expect(
        authService.verifyEmail(loginRequestDto, clientId),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1014')),
      );
    });
  });

  describe('checkOtpDuringValidation', () => {
    it('should throw BadRequestException if refId is not provided', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        ...client,

        otpExpiryInSeconds: 86400,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      await expect(
        authService.verifyEmail(
          { ...loginRequestDto, refId: undefined },

          clientId,
        ),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1067')),
      );
    });

    it('should provide authCode if user found', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,

        ...client,

        otpExpiryInSeconds: 86400,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      const otpDetail: any = {
        otp: '123456',

        phone: '1234567890',

        countryCode: '91',

        verifyOtpAttempt: 2,

        lastGetOtpAttemptedInMillis: Date.now() - 1000,
      };

      jest

        .spyOn(authOtpDetailService, 'findByRefId')

        .mockReturnValue(otpDetail);

      jest

        .spyOn(authService, 'generateAuthTokenAfterVerification')

        .mockResolvedValue({
          authCode:
            'b1a5e8f72b6aab3a26fcd26a3a4fe63fbdb62dbfea6ae8dddc2feae9ae7b4aa1',
        });

      jest.spyOn(restService, 'get').mockResolvedValue({
        _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',

        profile: {
          phone: '1234567890',

          countryCode: '91',

          email: 'test@example.com',
        },
      });

      const result = await authService.verifyEmail(loginRequestDto, clientId);

      await expect(result.authCode).toEqual(
        'b1a5e8f72b6aab3a26fcd26a3a4fe63fbdb62dbfea6ae8dddc2feae9ae7b4aa1',
      );
    });

    it('should provide authCode if user found with email', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: null,

        countryCode: null,

        ...loginRequestEmailDto,
      };
      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,

        ...client,

        otpExpiryInSeconds: 86400,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      const otpDetail: any = {
        otp: '123456',

        phone: '8552049006',

        countryCode: '91',

        verifyOtpAttempt: 2,

        lastGetOtpAttemptedInMillis: Date.now() - 1000,
      };

      jest

        .spyOn(authOtpDetailService, 'findByRefId')

        .mockReturnValue(otpDetail);

      jest

        .spyOn(authService, 'generateAuthTokenAfterVerification')

        .mockResolvedValue({
          authCode:
            'b1a5e8f72b6aab3a26fcd26a3a4fe63fbdb62dbfea6ae8dddc2feae9ae7b4aa1',
        });

      jest.spyOn(restService, 'get').mockResolvedValue({
        _id: 'ee6caedc2ef37f13cfb95d0292078c4d456fe9fdd1e6971d7abb2b93079102e9',

        profile: {
          phone: '1234567890',

          countryCode: '91',

          email: 'test@example.com',
        },
      });

      const result = await authService.verifyEmail(
        { ...loginRequestDto, phone: undefined, countryCode: undefined },

        clientId,
      );

      await expect(result.authCode).toEqual(
        'b1a5e8f72b6aab3a26fcd26a3a4fe63fbdb62dbfea6ae8dddc2feae9ae7b4aa1',
      );
      expect(restService.get).toBeCalledTimes(1);
    });

    it('should throw BadRequestException if giga-profile user is not found', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '8552049006',

        countryCode: '91',

        ...loginRequestEmailDto,
      };
      const queryString = `phone=${loginRequestDto.phone}&countryCode=${loginRequestDto.countryCode}&quadrant=profile`;

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        userdb: DbType.GIGA_PROFILE,

        ...client,

        otpExpiryInSeconds: 86400,
      };

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      const otpDetail: any = {
        otp: '123456',

        phone: '8552049006',

        countryCode: '91',

        verifyOtpAttempt: 2,

        lastGetOtpAttemptedInMillis: Date.now() - 1000,
      };

      jest

        .spyOn(authOtpDetailService, 'findByRefId')

        .mockReturnValue(otpDetail);

      jest.spyOn(restService, 'get').mockResolvedValue(null);

      await expect(
        authService.verifyEmail(loginRequestDto, clientId),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066')),
      );
      expect(restService.get).toBeCalledTimes(1);
      expect(restService.get).toBeCalledWith(
        `${GIGA_PROFILE_ENDPOINT}/giga-profile/v1/check-user?${queryString}`,
      );
    });

    it('should throw BadRequestException if dxp user is not found', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',

        phone: '1234567890',

        countryCode: '91',

        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        userdb: 'dxp',

        ...client,

        otpExpiryInSeconds: 86400,
      };

      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(null);

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      const otpDetail: any = {
        otp: '123456',

        phone: '8552049006',

        countryCode: '91',

        verifyOtpAttempt: 2,

        lastGetOtpAttemptedInMillis: Date.now() - 1000,
      };

      jest

        .spyOn(authOtpDetailService, 'findByRefId')

        .mockReturnValue(otpDetail);

      await expect(
        authService.verifyEmail(loginRequestDto, clientId),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066')),
      );
    });

    it('should throw BadRequestException email or phone and country code not provided', async () => {
      const loginRequestDto: LoginRequestDto = {
        ...loginRequestEmailDto,
      };

      const clientId = 'TCG-Client-Id';

      const authClientStore = {
        userdb: 'dxp',

        ...client,

        otpExpiryInSeconds: 86400,
      };

      jest.spyOn(userService, 'findByEmailOrPhone').mockResolvedValue(null);

      authClientRepo.findById = jest.fn().mockResolvedValue(authClientStore);

      const otpDetail: any = {
        otp: '123456',

        phone: '8552049006',

        countryCode: '91',

        verifyOtpAttempt: 2,

        lastGetOtpAttemptedInMillis: Date.now() - 1000,
      };

      jest

        .spyOn(authOtpDetailService, 'findByRefId')

        .mockReturnValue(otpDetail);

      await expect(
        authService.verifyEmail(
          {
            ...loginRequestDto,

            email: undefined,

            phone: undefined,

            countryCode: undefined,
          },

          clientId,
        ),
      ).rejects.toThrow(
        new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066')),
      );
    });
  });
});

const newUser = new CreateUserDto();

newUser.email = 'test@test.com';

newUser._id = '123456';

newUser.phone = '123456789';

newUser.password = 'password';

const dbUser = new CreateUserDto();

dbUser.email = 'test@test.com';

dbUser._id = '123456';

dbUser.phone = '123456789';

dbUser.password =
  '$2b$10$WrGXjPBw2dKO/8LdsAbv8.oVghZFeFNaQp3MxAMdHdJ8HYQ3YsZlS';

const loginRequestEmailDto = new LoginRequestDto();

loginRequestEmailDto.email = 'test@test.com';

loginRequestEmailDto.otp = '123456';

loginRequestEmailDto.clientId = '123456';

loginRequestEmailDto.refId = '123456789';

loginRequestEmailDto.authCode = 'auth_code';

loginRequestEmailDto.codeChallenge =
  'QIcvKDOIPPgvlyt-HaFtcL59O0Q597hEtsYGFPmjTXk';

loginRequestEmailDto.codeVerifier =
  '1Jq809LpmQja3tCzTiTXnfyOn7Iz-eMth2q8tu_R-rBMCXkvzW5-oJCOl5RcufVyxTViraLJURyXDjtgi3ekeQbgSYbztRNpGMhclXRn9CD.y3omUDCiFOrSSAwaGsx.';

const loginRequestPhoneDto = new LoginRequestDto();

loginRequestPhoneDto.phone = '123456789';

loginRequestPhoneDto.countryCode = '91';

loginRequestPhoneDto.otp = '123456';

loginRequestPhoneDto.clientId = '123456';

loginRequestPhoneDto.refId = '123456789';

loginRequestPhoneDto.authCode = 'auth_code';

loginRequestPhoneDto.codeChallenge =
  'QIcvKDOIPPgvlyt-HaFtcL59O0Q597hEtsYGFPmjTXk';

loginRequestPhoneDto.codeVerifier =
  '1Jq809LpmQja3tCzTiTXnfyOn7Iz-eMth2q8tu_R-rBMCXkvzW5-oJCOl5RcufVyxTViraLJURyXDjtgi3ekeQbgSYbztRNpGMhclXRn9CD.y3omUDCiFOrSSAwaGsx.';

const loginRequestEmailPasswordDto = new LoginRequestDto();

loginRequestEmailPasswordDto.email = 'test@test.com';

loginRequestEmailPasswordDto.clientId = '123456';

loginRequestEmailPasswordDto.password = 'password';

loginRequestEmailPasswordDto.codeChallenge =
  'QIcvKDOIPPgvlyt-HaFtcL59O0Q597hEtsYGFPmjTXk';

loginRequestEmailPasswordDto.codeVerifier =
  '1Jq809LpmQja3tCzTiTXnfyOn7Iz-eMth2q8tu_R-rBMCXkvzW5-oJCOl5RcufVyxTViraLJURyXDjtgi3ekeQbgSYbztRNpGMhclXRn9CD.y3omUDCiFOrSSAwaGsx.';

const client = new CreateAuthClientDto();

client._id = '123456';

client.clientName = 'web';

client.authCodeExpiry = 3000;

client.accessTokenExpiry = 1000;

client.refreshTokenExpiry = 3000;

client.otpAttemptAllowed = 3;

client.otpBlockIntervalInMins = 15;

client.otpResendAllowed = 3;

client.otpExpiryInSeconds = 300;

const authOtpDetail = new CreateAuthOtpDetailDto();

authOtpDetail.email = 'test@test.com';

authOtpDetail.phone = '123456789';

authOtpDetail.refId = '123456789';

authOtpDetail.otp = '123456';

authOtpDetail.clientId = '123456';

authOtpDetail.lastGetOtpAttemptedInMillis = Date.now();

authOtpDetail.verifyOtpAttempt = 1;

authOtpDetail.resendOtp = 1;

const createAuthPkceDto = new CreateAuthPkceDto();

createAuthPkceDto.email = 'test@test.com';

createAuthPkceDto.phone = '123456789';

createAuthPkceDto.codeChallenge = 'QIcvKDOIPPgvlyt-HaFtcL59O0Q597hEtsYGFPmjTXk';

createAuthPkceDto.clientId = '123456';

createAuthPkceDto.code = 'auth_code';

const createAuthAccessTokenDto = new CreateAuthAccessTokenDto();

createAuthAccessTokenDto._id = '123456';

createAuthAccessTokenDto.clientId = '123456';

createAuthAccessTokenDto.refreshTokenId = '123456';

createAuthAccessTokenDto.userId = '123456';

const createAuthRefreshTokenDto = new CreateAuthRefreshTokenDto();

createAuthRefreshTokenDto._id = '123456';

createAuthRefreshTokenDto.clientId = '123456';

createAuthRefreshTokenDto.userId = '123456';
