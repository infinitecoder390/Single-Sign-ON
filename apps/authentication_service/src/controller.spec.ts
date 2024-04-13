import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './controller';
import { AuthService } from './service';
import { CreateAuthAccessTokenDto } from './dto/auth-access-token.dto';
import { CreateAuthClientDto } from './dto/auth-client.dto';
import { CreateAuthOtpDetailDto } from './dto/auth-otp-detail.dto';
import { CreateAuthPkceDto } from './dto/auth-pkce.dto';
import { CreateAuthRefreshTokenDto } from './dto/auth-refresh-token.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthAccessTokenRepo } from './repository/auth-access-token.repo';
import { AuthClientRepo } from './repository/auth-client.repo';
import { AuthOtpDetailRepo } from './repository/auth-otp-detail.repo';
import { AuthPkceRepo } from './repository/auth-pkce.repo';
import { AuthRefreshTokenRepo } from './repository/auth-refresh-token.repo';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthClientService } from './service/auth-client.service';
import { AuthOtpDetailService } from './service/auth-otp-detail.service';
import { AuthPkceService } from './service/auth-pkce.service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { UserService } from './user/service/user.service';
import { UserRepo } from './user/repository/user.repo';
import { CreateUserDto } from './user/dto/create-user.dto';
import { LoggerService } from './logger/logger.service';
import { CommonMethods } from '@app/common/common-utils/common-methods';
import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RestServiceModule } from '@app/common/rest-service/rest-service.module';
import { RestService } from '@app/common/rest-service/rest.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authClientRepo: AuthClientRepo;
  let authOtpDetailService: AuthOtpDetailService;
  let authPkceService: AuthPkceService;
  let userService: UserService;
  let authPkceStoreRepo: AuthPkceRepo;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RestServiceModule],
      controllers: [AuthController],
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
                return 'http://gigaprofile.com';
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
        {
          provide: RestService,
          useFactory: () => ({
            get: jest.fn().mockResolvedValue({
              _id: 'he9hjefjjkhe9djhh',
              profile: {
                phone: '8552049006',
                countryCode: '91',
                email: 'ad@gmail.com',
              },
              userHash: 'he9hjefjjkhe9djhh',
            }),
            post: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authClientRepo = module.get<AuthClientRepo>(AuthClientRepo);
    authOtpDetailService =
      module.get<AuthOtpDetailService>(AuthOtpDetailService);

    authPkceService = module.get<AuthPkceService>(AuthPkceService);
    userService = module.get<UserService>(UserService);

    authPkceStoreRepo = module.get<AuthPkceRepo>(AuthPkceRepo);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login with email and password', async () => {
    const result = await controller.loginbyPhoneOrEmail(
      loginRequestEmailPasswordDto.clientId,
      loginRequestEmailPasswordDto,
    );
    expect(result.authCode).not.toBe(null);
  });

  it('should check email and send otp', async () => {
    const result = await controller.checkEmail(
      loginRequestEmailDto.clientId,
      loginRequestEmailDto,
    );
    expect(result.data['refId']).not.toBe(null);
  });

  it('should verify email with  an otp', async () => {
    await expect(
      controller.verifyEmail(
        loginRequestEmailDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1017')),
    );
  });

  it('should check phone and send otp', async () => {
    const result = await controller.checkEmail(
      loginRequestPhoneDto.clientId,
      loginRequestPhoneDto,
    );
    expect(result.data['refId']).not.toBe(null);
  });

  it('should verify phone with otp', async () => {
    await expect(
      controller.verifyEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1017')),
    );
  });

  it('should generate access and refresh tokens', async () => {
    const result = await controller.accessToken(
      loginRequestEmailDto.clientId,
      loginRequestEmailDto,
    );
    expect(result.accessToken).not.toBe(null);
    expect(result.refreshToken).not.toBe(null);
  });

  it('should verify email with otp, client Passed is not present', async () => {
    jest.spyOn(authClientRepo, 'findById').mockReturnValue(null);
    await expect(
      controller.verifyEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1002')),
    );
  });

  it('should verify email with otp, client Passed is not present', async () => {
    const payload = loginRequestPhoneDto;
    payload.otp = null;
    await expect(
      controller.verifyEmail(loginRequestPhoneDto.clientId, payload),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1005')),
    );
  });

  it('should verify email with otp, Ref Id does not match', async () => {
    jest.spyOn(authOtpDetailService, 'findByRefId').mockReturnValue(null);
    loginRequestPhoneDto.otp = '123456';
    await expect(
      controller.verifyEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1067')),
    );
  });

  it('should verify email with otp, otp not match', async () => {
    const payload = structuredClone(loginRequestPhoneDto);
    payload.otp = '1234567';
    await expect(
      controller.verifyEmail(loginRequestPhoneDto.clientId, payload),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1017')),
    );
  });

  // it('Maximum number of retries have been attempted', async () => {
  //   const response: any = {
  //     retryCount: '4',
  //   };
  //   const payload = loginRequestPhoneDto;
  //   payload.otp = '123456';
  //   jest.spyOn(authOtpDetailService, 'findByRefId').mockReturnValue(response);
  //   await expect(
  //     controller.verifyEmail(
  //       loginRequestPhoneDto.clientId,
  //       loginRequestPhoneDto,
  //     ),
  //   ).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1015')),
  //   );
  // });

  it('The retry attempt is blocked. Please try later', async () => {
    const response: any = {
      blocked: true,
      unblockTimeInMillis: Date.now() + 1000,
    };
    jest.spyOn(authOtpDetailService, 'findByRefId').mockReturnValue(response);
    await expect(
      controller.checkEmail(
        loginRequestPhoneDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1076')),
    );
  });

  it('AuthCode not present', async () => {
    const payload = loginRequestEmailDto;
    payload.authCode = null;
    await expect(
      controller.accessToken(loginRequestEmailDto.clientId, payload),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019')),
    );
  });

  it('AuthCode not present, auth pcke empty', async () => {
    const payload = loginRequestEmailDto;
    payload.authCode = 'auth_code';
    jest.spyOn(authPkceService, 'findByCode').mockReturnValue(null);
    await expect(
      controller.accessToken(loginRequestEmailDto.clientId, payload),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019')),
    );
  });

  it('Invalid CodeVerifier', async () => {
    const reponse: any = {
      codeChallenge: '123',
    };
    jest.spyOn(authPkceService, 'findByCode').mockReturnValue(reponse);
    await expect(
      controller.accessToken(
        loginRequestEmailDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1020')),
    );
  });

  it('empty code verifier passed', async () => {
    const payload = loginRequestEmailDto;
    payload.codeVerifier = null;
    await expect(
      controller.accessToken(loginRequestEmailDto.clientId, payload),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1022')),
    );
  });

  it('empty code challenge passed', async () => {
    const payload = loginRequestEmailPasswordDto;
    payload.codeChallenge = null;
    await expect(
      controller.loginbyPhoneOrEmail(
        loginRequestEmailPasswordDto.clientId,
        payload,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1023')),
    );
  });

  it('AuthCode is expired', async () => {
    const response: any = {
      expiryDateTime: Date.now() - 10000,
    };
    jest.spyOn(authPkceService, 'findByCode').mockReturnValue(response);
    await expect(
      controller.accessToken(
        loginRequestEmailDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1024')),
    );
  });

  it('user Is not present Please enter the correct user login credential', async () => {
    jest.spyOn(userService, 'findByEmail').mockReturnValue(null);
    await expect(
      controller.loginbyPhoneOrEmail(
        loginRequestEmailPasswordDto.clientId,
        loginRequestEmailPasswordDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1030')),
    );
  });

  it('password does not match', async () => {
    const response: any = {
      password: '112133',
    };
    jest.spyOn(userService, 'findByEmail').mockReturnValue(response);
    await expect(
      controller.loginbyPhoneOrEmail(
        loginRequestEmailPasswordDto.clientId,
        loginRequestEmailPasswordDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1032')),
    );
  });

  // it('Email does not match', async () => {
  // const otpDetail: any = {
  //   otp: '123456',
  //   phone: '123456789',
  //   email: 'test@gmail.com',
  // };
  // jest.spyOn(authOtpDetailService, 'findByEmail').mockReturnValue(otpDetail);
  //   await expect(
  //     controller.verifyEmail(
  //       loginRequestEmailDto.clientId,
  //       loginRequestEmailDto,
  //     ),
  //   ).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1055')),
  //   );
  // });

  // it('Something went wrong with email or phone', async () => {
  //   const payload = loginRequestEmailDto;
  //   payload.phone = null;
  //   payload.email = null;
  //   await expect(
  //     controller.verifyEmail(loginRequestEmailDto.clientId, payload),
  //   ).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1057')),
  //   );
  // });

  // it('Create Auth User By Admin,Email is already exist.', async () => {
  //   await expect(controller.createAuthUserByAdmin(newUser)).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1064')),
  //   );
  // });

  // it('Create Auth User By Admin,Phone Number is already exist.', async () => {
  //   const user: any = {
  //     email: 'user@gmail.com',
  //   };
  //   jest.spyOn(userRepo, 'findByEmail').mockReturnValue(user);
  //   await expect(controller.createAuthUserByAdmin(newUser)).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1065')),
  //   );
  // });

  // it('Create Auth User By Admin,Email is already exist.', async () => {
  //   const user: any = {
  //     emailVerified: true,
  //   };
  //   jest.spyOn(userRepo, 'findByEmail').mockReturnValue(user);
  //   await expect(controller.createAuthUserByAdmin(newUser)).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1064')),
  //   );
  // });

  // it('Create Auth User By Admin,Phone Number is already exist.', async () => {
  //   const user: any = {
  //     phoneVerified: true,
  //   };
  //   jest.spyOn(userRepo, 'findByPhone').mockReturnValue(user);
  //   await expect(controller.createAuthUserByAdmin(newUser)).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1065')),
  //   );
  // });

  // it('Create Auth User By Admin', async () => {
  //   const user: any = {
  //     email: 'user@gmail.com',
  //     phone: '112',
  //   };
  //   jest.spyOn(userRepo, 'findByEmail').mockReturnValue(user);
  //   jest.spyOn(userRepo, 'findByPhone').mockReturnValue(user);
  //   const result = await controller.createAuthUserByAdmin(newUser);
  //   expect(result.email).not.toBe(null);
  // });

  // it('Create Auth User By Admin,Error in payload', async () => {
  //   await expect(controller.createAuthUserByAdmin(null)).rejects.toThrow(
  //     new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1063')),
  //   );
  // });

  it('User not found', async () => {
    loginRequestEmailDto.email = 'test@test.com';
    jest.spyOn(userService, 'findByEmailOrPhone').mockReturnValue(null);
    await expect(
      controller.checkEmail(
        loginRequestEmailDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066')),
    );
  });

  it('Otp details are null', async () => {
    loginRequestEmailDto.email = null;
    loginRequestEmailDto.phone = null;
    loginRequestEmailDto.refId = null;
    await expect(
      controller.verifyEmail(
        loginRequestEmailDto.clientId,
        loginRequestEmailDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1067')),
    );
  });

  it('Create client', async () => {
    const result = await controller.createClient(client);
    expect(result.timestamp).not.toBe(null);
  });

  it('Create client, Client Name already exist', async () => {
    const dbClient: any = {
      clientName: 'web',
    };
    jest.spyOn(authClientRepo, 'findByClientName').mockReturnValue(dbClient);
    const result = await controller.createClient(client);
    expect(`${result.code}:-${result.message}`).toEqual(
      CommonMethods.getSsoErrorMsg('SSO_1068'),
    );
  });

  it('Find User By EmailOrPhone, Either Email or Phone required', async () => {
    await expect(
      controller.findUserByEmailOrPhone(loginRequestEmailDto),
    ).rejects.toThrow(
      new RpcException(CommonMethods.getSsoErrorMsg('SSO_1069')),
    );
  });

  it('Find User By EmailOrPhone', async () => {
    loginRequestEmailDto.email = 'test@test.com';
    const result =
      await controller.findUserByEmailOrPhone(loginRequestEmailDto);
    expect(result.email).not.toBe(null);
  });

  it('findClientById success', async () => {
    const result = await controller.findClientById(
      loginRequestPhoneDto.clientId,
    );
    expect(result.clientName).not.toBe(null);
  });

  it('findClientById fail', async () => {
    jest.spyOn(authClientRepo, 'findById').mockReturnValue(null);
    await expect(
      controller.findClientById(loginRequestPhoneDto.clientId),
    ).rejects.toThrow(
      new RpcException(CommonMethods.getSsoErrorMsg('SSO_1002')),
    );
  });

  it('findPkceByCode success', async () => {
    const result = await controller.findPkceByCode(
      loginRequestPhoneDto.clientId,
    );
    expect(result.code).not.toBe(null);
  });

  it('findPkceByCode fail', async () => {
    jest
      .spyOn(authPkceStoreRepo, 'findByCode')
      .mockRejectedValue(new RpcException('some thing went wrong'));
    await expect(
      controller.findPkceByCode(loginRequestPhoneDto.clientId),
    ).rejects.toThrow(new RpcException('some thing went wrong'));
  });

  it('should fail on Resend Otp max attempts', async () => {
    //jest.spyOn(authClientRepo, 'findById').mockReturnValue(null);
    authOtpDetail.resendOtp = 3;
    await expect(
      controller.checkEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1076')),
    );
  });

  it('should fail on verify Otp max attempts', async () => {
    //jest.spyOn(authClientRepo, 'findById').mockReturnValue(null);
    authOtpDetail.verifyOtpAttempt = 3;
    await expect(
      controller.verifyEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1016')),
    );
  });

  it('should fail on expired Otp', async () => {
    //jest.spyOn(authClientRepo, 'findById').mockReturnValue(null);
    authOtpDetail.lastGetOtpAttemptedInMillis = Date.now() - 6 * 60000;
    await expect(
      controller.verifyEmail(
        loginRequestPhoneDto.clientId,
        loginRequestPhoneDto,
      ),
    ).rejects.toThrow(
      new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1014')),
    );
  });

  it('should find user in GIGA_PROFILE and generate OTP', async () => {
    authClientRepo.findById = jest.fn().mockResolvedValueOnce({
      ...client,
      userdb: 'giga-profile',
    });
    const result = await controller.checkEmail(
      loginRequestPhoneDto.clientId,
      loginRequestPhoneDto,
    );
    await expect(result.message).toEqual('Verified');
  });
  it('should find user in GIGA_PROFILE and generate otp by mail', async () => {
    authClientRepo.findById = jest.fn().mockResolvedValueOnce({
      ...client,
      userdb: 'giga-profile',
    });
    const loginRequestPhone = {
      ...loginRequestPhoneDto,
      email: 'admin07726@gmail.com',
    };
    const result = await controller.checkEmail(
      loginRequestPhone.clientId,
      loginRequestPhone,
    );
    await expect(result.message).toEqual('Verified');
  });
  it('should find user in GIGA_PROFILE and varify-OTP', async () => {
    authOtpDetail.verifyOtpAttempt = 5;
    authOtpDetail.lastGetOtpAttemptedInMillis = Date.now() - 6 * 60000;
    authClientRepo.findById = jest.fn().mockResolvedValueOnce({
      ...client,
      userdb: 'giga-profile',
      otpExpiryInSeconds: 86400,
    });
    const otpDetail: any = {
      otp: '123456',
      phone: '8552049006',
      countryCode: '91',
      verifyOtpAttempt: 2,
      lastGetOtpAttemptedInMillis: Date.now() - 1000,
    };
    jest.spyOn(authOtpDetailService, 'findByRefId').mockReturnValue(otpDetail);
    const result = await controller.verifyEmail(
      loginRequestPhoneDto.clientId,
      loginRequestPhoneDto,
    );
    expect(result.message).toEqual('Otp successfully verified');
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
