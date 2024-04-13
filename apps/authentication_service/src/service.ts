import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateAuthClientDto } from './dto/auth-client.dto';
import { AuthTokenData } from './dto/auth-token-data.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SharableUserData } from './dto/sharable-user-data.dto';
import { AuthClientService } from './service/auth-client.service';
import { AuthOtpDetailService } from './service/auth-otp-detail.service';
import { AuthPkceService } from './service/auth-pkce.service';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { CreateAuthOtpDetailDto } from './dto/auth-otp-detail.dto';
import { CreateAuthPkceDto } from './dto/auth-pkce.dto';
import { CreateAuthAccessTokenDto } from './dto/auth-access-token.dto';
import { CreateAuthRefreshTokenDto } from './dto/auth-refresh-token.dto';
import { UserService } from './user/service/user.service';
import { IAuthPkce } from '@app/common/interfaces/auth-pkce.interface';
import { IAuthClient } from '@app/common/interfaces/auth-client-interface';
import { IAuthOtpDetail } from '@app/common/interfaces/auth-otp-detail.interface';
import { IUser } from '@app/common/interfaces/user.interface';
import {
  ApplicationConstants,
  DbType,
  ROLES_FOR_WHICH_LOGIN_IS_NOT_ALLOWED,
} from './utils/application-contants';
import { IAuthAccessToken } from '@app/common/interfaces/auth-access-token.interface';
import { IAuthRefreshToken } from '@app/common/interfaces/auth-refresh-token.interface';
import { AUTH_OTP_TYPE } from '@app/common/enums/auth-enum';
import { CommonMethods } from '@app/common/common-utils/common-methods';
import { LoggerService } from './logger/logger.service';
import { RestService } from '@app/common/rest-service/rest.service';

@Injectable()
export class AuthService {
  constructor(
    private authOtpDetailService: AuthOtpDetailService,
    private authClientService: AuthClientService,
    private authPkceService: AuthPkceService,
    private authAccessTokenService: AuthAccessTokenService,
    private authRefreshTokenService: AuthRefreshTokenService,
    private readonly loggerService: LoggerService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private restService: RestService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async findOnePkceByAuthCode(code: string): Promise<IAuthPkce> {
    return await this.authPkceService.findByCode(code);
  }

  async verifyEmail(loginRequestDto: LoginRequestDto, clientId: string) {
    const client: IAuthClient = await this.authClientService.findById(clientId);

    const otpDetail: IAuthOtpDetail =
      await this.getOtpDocumentAfterValidationsOfParams(
        loginRequestDto,
        client,
      );
    this.loggerService.debug('ootpdetail = ' + JSON.stringify(otpDetail));

    if (this.isOtpBlocked(otpDetail)) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1016'));
    }

    const duration = Date.now() - otpDetail.lastGetOtpAttemptedInMillis;
    const otpVerified = otpDetail.otp == loginRequestDto.otp;

    if (duration >= client.otpExpiryInSeconds * 1000) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1014'));
    } else if (otpVerified && duration < client.otpExpiryInSeconds * 1000) {
      if (!otpDetail.validated) {
        const authTokenData = await this.generateAuthTokenAfterVerification(
          loginRequestDto,
          otpDetail,
          client,
        );
        return authTokenData;
      } else {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1075'));
      }
    } else {
      const verifyOtpAttempt =
        otpDetail.verifyOtpAttempt >=
        ApplicationConstants.SUBMIT_OTP_ATTEMPT_ALLOWED
          ? 1
          : otpDetail.verifyOtpAttempt + 1;
      const lastGetOtpAttemptedInMillis = Date.now();
      await this.authOtpDetailService.saveById(otpDetail._id, {
        verifyOtpAttempt,
        lastGetOtpAttemptedInMillis,
      });
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1017'));
    }
  }
  async generateAuthTokenAfterVerification(
    loginRequestDto: LoginRequestDto,
    otpDetail: IAuthOtpDetail,
    authClient: IAuthClient,
  ) {
    this.loggerService.debug('otpDetail ' + otpDetail);
    if (loginRequestDto.otp == otpDetail.otp) {
      this.loggerService.debug(
        'otp passed matches otp saved - refId ' + loginRequestDto.refId,
      );
      const authTokenData = await this.getAuthTokenData(
        loginRequestDto,
        authClient,
        otpDetail,
      );
      await this.authOtpDetailService.deleteById(otpDetail._id);
      return authTokenData;
    } else {
      const retryCount = otpDetail.retryCount + 1;
      this.loggerService.debug('retryCount ' + retryCount);
      this.authOtpDetailService.saveById(otpDetail._id, { retryCount });
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1007'));
    }
  }
  async getOtpDocumentAfterValidationsOfParams(
    loginRequestDto: LoginRequestDto,
    client: IAuthClient,
  ) {
    const otp = loginRequestDto.otp;
    const refId = loginRequestDto.refId;
    this.validateRefId(refId);
    this.validateOtp(otp);

    const otpDetail = await this.checkOtpDuringValidation(
      loginRequestDto,
      refId,
      client,
    );
    return otpDetail;
  }
  validateEmailOrPhone(
    otpDetail: IAuthOtpDetail,
    loginRequestDto: LoginRequestDto,
  ) {
    const email = loginRequestDto.email;
    const phoneNumber = loginRequestDto.phone;
    if (email != null || phoneNumber != null) {
      if (email != null && otpDetail.email !== email)
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1055'));
      if (phoneNumber != null && otpDetail.phone !== phoneNumber)
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1056'));
    } else {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1057'));
    }
  }
  async checkOtpDuringValidation(
    loginRequestDto: LoginRequestDto,
    refId: string,
    client: IAuthClient,
  ): Promise<IAuthOtpDetail> {
    if (refId) {
      const details = await this.authOtpDetailService.findByRefId(refId);
      this.loggerService.debug('OTP details >>>' + details);
      if (!details)
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1067'));
      let user;
      if (client.userdb === DbType.GIGA_PROFILE) {
        const queryParams: string[] = [];
        if (details && details.phone && details.countryCode) {
          queryParams.push(
            `phone=${details.phone}&countryCode=${details.countryCode}`,
          );
        }
        if (details && details.email) {
          queryParams.push(`email=${details.email}`);
        }
        if (details.email || (details.phone && details.countryCode)) {
          queryParams.push(`quadrant=profile`);
        }
        const queryString = queryParams.join('&');
        if (queryString) {
          this.loggerService.debug(
            'Giga profile Environment Variable' +
              this.configService.get('GIGA_PROFILE_ENDPOINT'),
          );
          const response = await this.restService.get(
            `${this.configService.get(
              'GIGA_PROFILE_ENDPOINT',
            )}/giga-profile/v1/check-user?${queryString}`,
          );

          if (response?.data?.items) {
            user = response.data.items;
          }
        }
      } else {
        user = await this.userService.findByEmailOrPhone(
          details.email,
          details.phone,
          details.countryCode,
        );
      }
      this.loggerService.debug('User---> >>>' + JSON.stringify(user));
      if (!user) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066'));
      }

      if (!CommonMethods.verifyPlatformIsActive(user, client.platformName)) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1089'));
      }

      return details;
    }

    throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1067'));
  }

  validateOtp(otp: string) {
    if (!otp) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1005'));
    }
  }
  validateRefId(refId: string) {
    if (!refId) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1087'));
    }
  }

  async getOtpSent(
    loginRequestDto: LoginRequestDto,
    clientId: string,
  ): Promise<SharableUserData> {
    const email = loginRequestDto.email;
    const phone = loginRequestDto.phone;
    let user;
    const authClientStore: IAuthClient =
      await this.authClientService.findById(clientId);

    if (authClientStore.userdb === DbType.GIGA_PROFILE) {
      const queryParams: string[] = [];
      if (phone && loginRequestDto.countryCode) {
        queryParams.push(
          `phone=${phone}&countryCode=${loginRequestDto.countryCode}`,
        );
      }
      if (email) {
        queryParams.push(`email=${email}`);
      }
      if (email || (phone && loginRequestDto.countryCode)) {
        queryParams.push(`quadrant=profile`);
      }

      const queryString = queryParams.join('&');

      if (queryString) {
        this.loggerService.debug(
          'Giga-profile Environment Variable ' +
            this.configService.get('GIGA_PROFILE_ENDPOINT'),
        );
        this.loggerService.debug('queryString' + queryString);
        const response = await this.restService.get(
          `${this.configService.get(
            'GIGA_PROFILE_ENDPOINT',
          )}/giga-profile/v1/check-user?${queryString}`,
        );

        if (response?.data?.items) {
          user = response.data.items;
        }
      }
    } else {
      user = await this.userService.findByEmailOrPhone(
        email,
        phone,
        loginRequestDto.countryCode,
      );
    }
    const isServiceCommercePartnerHelper =
      user &&
      user.application &&
      user.application.serviceCommerce &&
      user.application.serviceCommerce.serviceCommercePartnerApp &&
      ROLES_FOR_WHICH_LOGIN_IS_NOT_ALLOWED.includes(
        user.application.serviceCommerce.serviceCommercePartnerApp
          .serviceCommercePartnerType,
      );

    if (isServiceCommercePartnerHelper) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1092'));
    }

    this.loggerService.debug('User Details ' + JSON.stringify(user));
    if (!user) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1066'));
    }

    if (
      !CommonMethods.verifyPlatformIsActive(user, authClientStore.platformName)
    ) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1089'));
    }

    const otpData = await this.sendOtpToUser(
      user,
      loginRequestDto,
      authClientStore,
    );
    const returnData = new SharableUserData();
    //returnData.otp = otpData.otp;
    returnData.refId = otpData.refId;
    if (loginRequestDto.email) returnData.email = loginRequestDto.email;

    if (loginRequestDto.phone) {
      returnData.phone = loginRequestDto.phone;
      returnData.countryCode = loginRequestDto.countryCode;
    }

    return returnData;
  }
  async sendOtpToUser(
    user: IUser,
    loginRequestDto: LoginRequestDto,
    authClient: IAuthClient,
  ) {
    const email = loginRequestDto.email;
    const phone = loginRequestDto.phone;

    const existingOtpObj: IAuthOtpDetail =
      await this.authOtpDetailService.findByEmailOrPhone(
        email,
        phone,
        loginRequestDto.countryCode,
      );
    const otp = CommonMethods.getOtp();
    this.loggerService.debug('existingOtpObj' + existingOtpObj);

    let otpDetails: IAuthOtpDetail = null;
    const otpType = email
      ? AUTH_OTP_TYPE.login_email_otp
      : AUTH_OTP_TYPE.login_phone_otp;

    if (this.isOtpBlocked(existingOtpObj)) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1076'));
    } else if (this.isResendOtpBlocked(existingOtpObj)) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1076'));
    } else if (existingOtpObj) {
      existingOtpObj.otp = otp;
      existingOtpObj.refId = uuidv4();
      existingOtpObj.expiryTime =
        Date.now() + authClient.otpExpiryInSeconds * 1000;
      existingOtpObj.otpType = otpType;
      existingOtpObj.lastGetOtpAttemptedInMillis = Date.now();

      if (otpType == AUTH_OTP_TYPE.login_email_otp) {
        existingOtpObj.email = email;
      } else if (otpType == AUTH_OTP_TYPE.login_phone_otp) {
        existingOtpObj.phone = phone;
      }

      if (existingOtpObj.resendOtp >= ApplicationConstants.GET_RESEND_ALLOWED) {
        existingOtpObj.resendOtp = 1;
      } else {
        existingOtpObj.resendOtp = existingOtpObj.resendOtp + 1;
      }

      existingOtpObj.verifyOtpAttempt = 0;
      existingOtpObj.lastGetOtpAttemptedInMillis = Date.now();

      otpDetails = await this.authOtpDetailService.saveById(
        existingOtpObj._id,
        existingOtpObj,
      );
    } else if (!existingOtpObj) {
      const newOtpDetail = new CreateAuthOtpDetailDto();
      newOtpDetail.clientId = authClient.id;
      newOtpDetail.otp = otp;
      newOtpDetail.refId = uuidv4();
      newOtpDetail.expiryTime =
        Date.now() + authClient.otpExpiryInSeconds * 1000;
      newOtpDetail.otpType = otpType;
      newOtpDetail.lastGetOtpAttemptedInMillis = Date.now();
      if (otpType == AUTH_OTP_TYPE.login_email_otp) {
        newOtpDetail.email = email;
      } else if (otpType == AUTH_OTP_TYPE.login_phone_otp) {
        newOtpDetail.phone = phone;
        newOtpDetail.countryCode = loginRequestDto.countryCode;
      }
      newOtpDetail.resendOtp = 1;
      otpDetails = await this.authOtpDetailService.create(newOtpDetail);
    }

    this.sendSmsOtp(authClient, user, otpDetails);

    return otpDetails;
  }

  async sendSmsOtp(
    authClient: IAuthClient,
    user: IUser,
    otpDetails: IAuthOtpDetail,
  ) {
    const url = `${this.configService.get(
      'COMMUNICATION_SERVICE_END_POINT',
    )}/v1/notifications/send-comms`;

    const otpData = {};

    otpData['alert_template'] = `${this.configService.get(
      'COMMUNICATION_SERVICE_SMS_TEMPLATE',
    )}_${authClient.platformName}`;

    otpData['platform_id'] = authClient.platformName;
    otpData['transaction_id'] = otpDetails.refId;
    otpData['client_id'] = authClient._id;

    if (authClient.platformName == 'DXP') {
      otpData['billing_entity'] = {
        orgId: user['application']['dxp']['dxpAdmin']['orgId'],
      };
    } else {
      otpData['billing_entity'] = {
        orgId: 'NON_DXP',
      };
    }

    otpData['user_id'] = [user['userHash']];

    otpData['payloads'] = {
      SMS: {
        [user['userHash']]: {
          recipient: otpDetails.phone,
          personalized_attributes: {
            OTP: otpDetails.otp,
            time: '' + authClient.otpExpiryInSeconds / 60,
          },
        },
      },
    };

    this.loggerService.debug('abount to send sms Otp');
    try {
      const respose = await this.restService.post(url, otpData, {
        headers: {
          auth_key: this.configService.get(
            'COMMUNICATION_SERVICE_SMS_AUTH_KEY',
          ),
        },
      });

      this.loggerService.debug(
        'send sms response >> ' + JSON.stringify(respose),
      );

      return respose;
    } catch (e) {
      this.loggerService.error('error while sending otp sms >> ' + e);
    }
  }

  isOtpBlocked(otp: IAuthOtpDetail): boolean {
    this.loggerService.debug('inside isOtpBlocked otp ' + otp);

    if (!otp) return false;

    const duration = Date.now() - otp.lastGetOtpAttemptedInMillis;
    const blockInterval =
      ApplicationConstants.OTP_BLOCK_INTERVAL_IN_MINS * 60 * 1000;

    if (
      otp.verifyOtpAttempt < ApplicationConstants.SUBMIT_OTP_ATTEMPT_ALLOWED
    ) {
      return false;
    } else {
      this.loggerService.debug(
        'duration is less then block interval >>' + (duration < blockInterval),
      );

      return duration < blockInterval;
    }
  }

  isResendOtpBlocked(otp: IAuthOtpDetail): boolean {
    if (!otp) return false;

    const duration = Date.now() - otp.lastGetOtpAttemptedInMillis;
    const blockInterval =
      ApplicationConstants.OTP_BLOCK_INTERVAL_IN_MINS * 60 * 1000;
    if (otp.resendOtp < ApplicationConstants.GET_RESEND_ALLOWED) {
      return false;
    } else if (duration < blockInterval) {
      return true;
    } else {
      return false;
    }
  }

  async getExistingOrNewOtpObject(
    otp: string,
    client: IAuthClient,
    existingOtpObj: IAuthOtpDetail,
    email: string,
    phone: string,
    otpType: AUTH_OTP_TYPE,
  ): Promise<IAuthOtpDetail | CreateAuthOtpDetailDto> {
    const createTime = Date.now();
    if (existingOtpObj) {
      existingOtpObj.refId = uuidv4();
      existingOtpObj.expiryTime = createTime + client.otpExpiryInSeconds * 1000;
      existingOtpObj.otp = otp;
      existingOtpObj.lastGetOtpAttemptedInMillis = Date.now();
      return existingOtpObj;
    } else {
      const newOtpDetail = new CreateAuthOtpDetailDto();

      newOtpDetail.otp = otp;
      newOtpDetail.refId = uuidv4();
      newOtpDetail.clientId = client.id;
      newOtpDetail.expiryTime = createTime + client.otpExpiryInSeconds * 1000;
      newOtpDetail.otpType = otpType;
      newOtpDetail.lastGetOtpAttemptedInMillis = Date.now();

      if (otpType == AUTH_OTP_TYPE.login_email_otp) {
        newOtpDetail.email = email;
      } else if (otpType == AUTH_OTP_TYPE.login_phone_otp) {
        newOtpDetail.phone = phone;
      }
      return newOtpDetail;
    }
  }
  async createAuthClient(createAuthClientDto: CreateAuthClientDto) {
    return await this.authClientService.createClient(createAuthClientDto);
  }

  async loginbyPhoneOremail(
    loginRequestDto: LoginRequestDto,
    clientId: string,
  ) {
    const email = loginRequestDto.email;
    const phone = loginRequestDto.phone;
    const password = loginRequestDto.password;

    const client: IAuthClient = await this.authClientService.findById(clientId);

    if (email) {
      const user = await this.userService.findByEmail(email);
      this.userService.validateUser(user);

      if (!(await CommonMethods.matchPasswordHash(password, user.password))) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1032'));
      }
    } else if (phone) {
      const user = await this.userService.findByPhone(
        phone,
        loginRequestDto.countryCode,
      );
      this.userService.validateUser(user);
      if (!(await CommonMethods.matchPasswordHash(password, user.password))) {
        throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1032'));
      }
    }

    return this.getAuthTokenData(loginRequestDto, client, null);
  }

  async getAuthTokenData(
    loginRequestDto: LoginRequestDto,
    client: IAuthClient,
    otpDetail: IAuthOtpDetail,
  ) {
    let email;
    let phone;
    let countryCode;
    if (otpDetail) {
      email = otpDetail.email;
      phone = otpDetail.phone;
      countryCode = otpDetail.countryCode;
    } else {
      email = loginRequestDto.email;
      phone = loginRequestDto.phone;
      countryCode = loginRequestDto.countryCode;
    }
    this.validateCodeChallenge(loginRequestDto.codeChallenge);
    this.loggerService.debug('Code challenge is verified');
    const code = await CommonMethods.generateAuthorizationCode(
      email ? email : phone,
    );
    this.loggerService.debug('code = ' + code);
    const pkceStore = new CreateAuthPkceDto();
    pkceStore.clientId = client.id;
    pkceStore.countryCode = countryCode;
    pkceStore.phone = phone;
    pkceStore.email = email;

    pkceStore.code = code;
    pkceStore.codeChallenge = loginRequestDto.codeChallenge;
    pkceStore.expiryDateTime = Date.now() + client.authCodeExpiry * 1000;

    await this.authPkceService.create(pkceStore);
    return new AuthTokenData(code);
  }
  validateCodeChallenge(codeChallenge: string) {
    if (!codeChallenge || !codeChallenge.trim()) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1023'));
    }
  }

  async getAccessToken(loginRequestDto: LoginRequestDto, clientId: string) {
    const authCode = loginRequestDto.authCode;

    if (!authCode) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019'));
    }

    const pkce = await this.authPkceService.findByCode(authCode);

    const authClient = await this.authClientService.findById(clientId);

    if (!pkce) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019'));
    }

    this.validatePkceObject(pkce);

    const codeVerifier = loginRequestDto.codeVerifier;

    await this.verifyCodeChallengeAndVerifier(pkce.codeChallenge, codeVerifier);

    const user = await this.userService.findByEmailOrPhone(
      pkce.email,
      pkce.phone,
      pkce.countryCode,
    );

    const refreshToken = await this.generateRefreshToken(user, authClient);

    const accessToken = await this.generateAccessToken(
      user,
      refreshToken._id,
      authClient,
    );

    return await this.getClientJwtTokens(
      accessToken,
      refreshToken,
      user,
      authClient,
    );
  }
  async getClientJwtTokens(
    accessToken: IAuthAccessToken,
    refreshToken: IAuthRefreshToken,
    user: IUser,
    authClient: IAuthClient,
  ) {
    const accessTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      jti: accessToken.id,
    };
    const refreshTokenJwtPayload = {
      sub: user.id,
      email: user.email,
      jti: refreshToken.id,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(accessTokenJwtPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: authClient.accessTokenExpiry,
      }),
      this.jwtService.signAsync(refreshTokenJwtPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: authClient.refreshTokenExpiry,
      }),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async generateAccessToken(
    user: IUser,
    refreshToken: string,
    authClient: IAuthClient,
  ) {
    const accessToken = new CreateAuthAccessTokenDto();
    accessToken.userId = user.id;
    accessToken.refreshTokenId = refreshToken;
    accessToken.accessTokenExpiresAt =
      Date.now() + authClient.accessTokenExpiry;

    return await this.authAccessTokenService.create(accessToken);
  }
  async generateRefreshToken(
    user: IUser,
    authClientStore: IAuthClient,
  ): Promise<IAuthRefreshToken> {
    const refreshToken = new CreateAuthRefreshTokenDto();

    refreshToken.clientId = authClientStore.id;
    refreshToken.userId = user.id;
    refreshToken.refreshTokenExpiresAt =
      Date.now() + authClientStore.refreshTokenExpiry;

    return await this.authRefreshTokenService.create(refreshToken);
  }

  validatePkceObject(pkceStoreObj: IAuthPkce) {
    if (Date.now() > pkceStoreObj.expiryDateTime) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1024'));
    }
  }

  async verifyCodeChallengeAndVerifier(
    codeChallenge: string,
    codeVerifier: string,
  ) {
    if (!codeVerifier) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1022'));
    }

    const challengeGenerated =
      await CommonMethods.generateCodeChallenge(codeVerifier);

    if (challengeGenerated !== codeChallenge) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1020'));
    }
  }
}
