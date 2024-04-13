import { CommonMethods } from '@app/common/common-utils/common-methods';
import { IAuthAccessToken } from '@app/common/interfaces/auth-access-token.interface';
import { IAuthClient } from '@app/common/interfaces/auth-client-interface';
import { IAuthPkce } from '@app/common/interfaces/auth-pkce.interface';
import { IAuthRefreshToken } from '@app/common/interfaces/auth-refresh-token.interface';
import { IUser } from '@app/common/interfaces/user.interface';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthAccessTokenResponseDto } from './dto/auth-access-token-response.dto';
import { CreateAuthAccessTokenDto } from './dto/auth-access-token.dto';
import { CreateAuthAuditDto } from './dto/auth-audit.dto';
import { CreateAuthRefreshTokenDto } from './dto/auth-refresh-token.dto';
import { CheckAuthDto } from './dto/check-auth.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoggerService } from './logger/logger.service';
import { AuthAccessTokenService } from './service/auth-access-token.service';
import { AuthAuditService } from './service/auth-audit.service';
import { AuthRefreshTokenService } from './service/auth-refresh-token.service';
import { RestService } from '@app/common/rest-service/rest.service';
import { UserRoleRepo } from './repository/user-role.repo';
import { UserDto } from './dto/user.dto';
import { RoleRepo } from './repository/roles.repo';
import { PermissionRepo } from './repository/permission.repo';
import { PermissionService } from './service/permission.service';
import { RolesService } from './service/roles.service';
import { UserRoleService } from './service/user-role.service';
import { CreateRoleDto } from './dto/roles.dto';
import { CreateUserRoleDto } from './dto/user-roles.dto';
import { ApplicationConstants, DbType } from './utils/application-contants';
import { BulkFetchUserRoleDto } from './dto/bulk-fetch-user-role.dto';

@Injectable()
export class AuthorizationService {
  constructor(
    private authRefreshTokenService: AuthRefreshTokenService,

    private authAccessTokenService: AuthAccessTokenService,
    private authAuditService: AuthAuditService,
    private readonly loggerService: LoggerService,

    private jwtService: JwtService,

    private configService: ConfigService,

    private restService: RestService,

    private permissionService: PermissionService,

    private roleService: RolesService,

    private userRoleService: UserRoleService,

    private userRoleRepo: UserRoleRepo,

    private roleRepo: RoleRepo,

    private permissionRepo: PermissionRepo,

    @Inject('AUTHENTICATION_SERVICE')
    private authenticationService: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getAccessToken(
    loginRequestDto: LoginRequestDto,
    clientId: string,
  ): Promise<AuthAccessTokenResponseDto> {
    const authCode = loginRequestDto.authCode;
    if (!authCode) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019'));
    }
    let authClient;
    try {
      authClient = await firstValueFrom(
        this.authenticationService.send(
          {
            cmd: 'findClientById',
          },
          clientId,
        ),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const pkce = await firstValueFrom(
      this.authenticationService.send(
        {
          cmd: 'findPkceByCode',
        },
        authCode,
      ),
    );
    this.loggerService.debug('pkce' + JSON.stringify(pkce));

    if (!pkce) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1019'));
    }

    this.validatePkceObject(pkce);

    // delete the pkce once validated
    await firstValueFrom(
      this.authenticationService.send(
        {
          cmd: 'deletePkceById',
        },
        pkce._id,
      ),
    );
    const codeVerifier = loginRequestDto.codeVerifier;
    await this.verifyCodeChallengeAndVerifier(pkce.codeChallenge, codeVerifier);
    let user;
    if (authClient.userdb === DbType.GIGA_PROFILE) {
      const queryParams: string[] = [];
      if (pkce.phone && pkce.countryCode) {
        queryParams.push(`phone=${pkce.phone}&countryCode=${pkce.countryCode}`);
      }
      if (pkce.email) {
        queryParams.push(`email=${pkce.email}`);
      }
      if (pkce.email || (pkce.phone && pkce.countryCode)) {
        queryParams.push(`quadrant=profile`);
      }
      const queryString = queryParams.join('&');
      if (queryString) {
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
      user = await firstValueFrom(
        this.authenticationService.send(
          {
            cmd: 'findUserByEmailOrPhone',
          },
          {
            email: pkce.email,
            phone: pkce.phone,
            countryCode: pkce.countryCode,
          },
        ),
      );
    }

    if (!CommonMethods.verifyPlatformIsActive(user, authClient.platformName)) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1089'));
    }

    const refreshToken = await this.generateRefreshToken(user, authClient);
    const accessToken = await this.generateAccessToken(
      user._id,
      refreshToken.orgId,
      refreshToken._id,
      authClient,
    );
    const createAuthAuditDto: CreateAuthAuditDto = {
      clientId: authClient._id,
      userId: user._id,
    };
    await this.authAuditService.create(createAuthAuditDto);
    return await this.getClientJwtTokens(accessToken, refreshToken, authClient);
  }
  async getClientJwtTokens(
    accessToken: IAuthAccessToken,
    refreshToken: IAuthRefreshToken,
    authClient: IAuthClient,
  ) {
    this.loggerService.debug('Inside getClientJwtTokens');
    this.loggerService.debug(`authClient, ${JSON.stringify(authClient)}`);
    this.loggerService.debug(`userId, ${refreshToken.userId}`);

    const userRoles = await this.userRoleRepo.findRolesByUserId(
      refreshToken.userId,
      authClient.platformName,
    );

    this.loggerService.debug(`userRoles, ${userRoles}`);

    const roleIds = userRoles.map((arole) => arole.roleId);

    this.loggerService.debug(`roleIds, ${roleIds}`);

    const roles = await this.roleRepo.findRolesByIds(roleIds);

    this.loggerService.debug(`roles, ${roles}`);

    const permissionIds = [];
    const roleMapWithPerms = new Map();
    let isAdmin = false;
    let isSuperAdmin = false;
    for (const arole of roles) {
      if (arole.permissionIds.indexOf('DXP_ORG_ADMIN') > -1) {
        isAdmin = true;
      }
      if (arole.permissionIds.indexOf('DXP_SUPER_ADMIN') > -1) {
        isSuperAdmin = true;
      }

      permissionIds.push(...arole.permissionIds);
      roleMapWithPerms.set(arole.roleId, arole.permissionIds);
    }

    this.loggerService.debug(`roleMapWithPerms, ${roleMapWithPerms}`);

    this.loggerService.debug(`permissionIds, ${permissionIds}`);
    const permissions =
      await this.permissionRepo.findPermissionsByIds(permissionIds);

    this.loggerService.debug(`permissions, ${permissions}`);

    const permMapWithScopes = new Map();
    for (const aperm of permissions) {
      permMapWithScopes.set(aperm.permissionId, aperm);
    }

    this.loggerService.debug(`permMapWithScopes, ${permMapWithScopes.keys}`);

    const scopesFinal = [];
    const feScopesFinal = [];

    for (const anUrole of userRoles) {
      const perms = roleMapWithPerms.get(anUrole.roleId);

      if (perms) {
        for (const aperm of perms) {
          const permission = permMapWithScopes.get(aperm);

          let scopes = permission.scopes;
          let feScopes = permission.feScopes;
          if (
            anUrole.permissionEntity &&
            Object.keys(anUrole.permissionEntity).length > 0
          ) {
            for (const [key, value] of Object.entries(
              anUrole.permissionEntity,
            )) {
              this.loggerService.debug(`${key}: ${value}`);

              scopes = scopes.map(function (x) {
                return x.replace('$' + `{${key}}`, value);
              });
              feScopes = feScopes.map(function (x) {
                return x.replace('$' + `{${key}}`, value);
              });
            }
          }

          scopesFinal.push(...scopes);
          feScopesFinal.push(...feScopes);
        }
      }
    }

    this.loggerService.debug(`scopesFinal --> ${scopesFinal}`);
    this.loggerService.debug(`feScopesFinal -->   ${feScopesFinal}`);

    const accessTokenJwtPayload = {
      sub: accessToken.userId,
      jti: accessToken._id,
      orgId: accessToken.orgId,
      isSuperAdmin,
      isAdmin,
      iss: this.configService.get('JWT_ISS'),
      aud: this.configService.get('JWT_AUD'),
      scopes: [...new Set(scopesFinal)],
      feScopes: [...new Set(feScopesFinal)],
      permissionIds: [...new Set(permissionIds)],
    };
    const refreshTokenJwtPayload = {
      sub: refreshToken.userId,
      orgId: accessToken.orgId,
      jti: refreshToken._id,
      iss: this.configService.get('JWT_ISS'),
      aud: this.configService.get('JWT_AUD'),
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
    userId: string,
    orgId: string,
    refreshToken: string,
    authClient: IAuthClient,
  ) {
    const accessToken = new CreateAuthAccessTokenDto();
    accessToken.userId = userId;
    accessToken.orgId = orgId;

    accessToken.refreshTokenId = refreshToken;
    accessToken.accessTokenExpiresAt =
      Date.now() + authClient.accessTokenExpiry;
    accessToken.clientId = authClient.clientName;

    return await this.authAccessTokenService.create(accessToken);
  }
  async generateRefreshToken(
    user: IUser,
    authClientStore: IAuthClient,
  ): Promise<IAuthRefreshToken> {
    const refreshToken = new CreateAuthRefreshTokenDto();

    refreshToken.clientId = authClientStore.id;
    refreshToken.userId = user._id;
    if (authClientStore.platformName == 'DXP') {
      refreshToken.orgId = user['application']['dxp']['dxpAdmin']['orgId'];
    }

    refreshToken.refreshTokenExpiresAt =
      Date.now() + authClientStore.refreshTokenExpiry;
    refreshToken.clientId = authClientStore.clientName;

    return await this.authRefreshTokenService.create(refreshToken);
  }

  validatePkceObject(pkceStoreObj: IAuthPkce) {
    if (Date.now() > pkceStoreObj.expiryDateTime) {
      //pkceStoreRepository.delete(pkceStoreObj);
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
    this.loggerService.debug('Code challege = ' + codeChallenge);
    this.loggerService.debug('Code challege = ' + challengeGenerated);
    if (challengeGenerated !== codeChallenge) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1020'));
    }
  }

  async checkAuthorization(checkAuthDto: CheckAuthDto): Promise<boolean> {
    this.loggerService.debug(
      'checkAuthDto --> ' + JSON.stringify(checkAuthDto),
    );

    try {
      const decoded = this.jwtService.verify(checkAuthDto.jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });

      this.loggerService.debug(`decoded >> ${decoded}`);

      const accessToken = await this.authAccessTokenService.getAccessToken(
        decoded.jti,
      );

      this.loggerService.debug(`accessToken >> ${accessToken}`);

      if (!accessToken) {
        throw new UnauthorizedException(
          CommonMethods.getSsoErrorMsg('SSO_1073'),
        );
      }
      if (accessToken) {
        const urlItems = checkAuthDto.apiEndPoint.split(/\/v[1-9]\//);
        const urlToValidate = urlItems[0] + '/' + urlItems[1];

        this.loggerService.debug('Checking for whitelited usrls');
        if (
          this.isUrlWhitelisted(urlToValidate, checkAuthDto, {
            orgId: decoded.orgId,
          })
        ) {
          this.loggerService.debug(
            'whitelisted url matched for Backend Scopes.',
          );
          return decoded;
        }

        this.loggerService.debug(
          'Checking for Backend Scopes >>>>>>>>>>>>>>>>',
        );
        if (decoded.scopes) {
          const isMatched = this.checkScopesMatch(
            decoded.scopes,
            urlToValidate,
            checkAuthDto,
          );

          if (isMatched) {
            return decoded;
          }
        }
      }
    } catch (e) {
      this.loggerService.error(
        'authorization service -- Error in check authorization : ' + e.stack,
      );
      throw new UnauthorizedException(CommonMethods.getSsoErrorMsg('SSO_1073'));
    }
    this.loggerService.error('User is forbidden to go ahead...');
    throw new ForbiddenException(CommonMethods.getSsoErrorMsg('SSO_1074'));
  }

  checkScopesMatch(
    scopes: string[],
    urlToValidate: string,
    checkAuthDto: CheckAuthDto,
  ) {
    for (const aScope of scopes) {
      this.loggerService.debug('aScope --> ' + aScope);

      const scopeMethod = aScope.split('::')[0];
      let scopeEndPoint = aScope.split('::')[1];
      if ('ALL' == scopeMethod || scopeMethod == checkAuthDto.httpMethod) {
        scopeEndPoint = scopeEndPoint
          .replaceAll('?', '\\?')
          .replaceAll('permissionEntity.', 'permissionEntity\\.');

        const regex = new RegExp(scopeEndPoint);
        this.loggerService.debug('Request endpoint ' + urlToValidate);
        this.loggerService.debug('Scope EndPoint ' + regex);
        this.loggerService.debug('Scope Method ' + scopeMethod);

        const isMatched = regex.test(urlToValidate);
        this.loggerService.debug('isMatched --> ' + isMatched);
        this.loggerService.debug(
          '===================================================================',
        );

        if (!isMatched) continue;
        return true;
      }
    }

    return false;
  }

  isUrlWhitelisted(
    urlToValidate: string,
    checkAuthDto: CheckAuthDto,
    params: object,
  ) {
    const wruls = this.configService.get('WHITE_LISTED_URLS').split(',');

    const resolvedScoped = [];

    for (const aurl of wruls) {
      resolvedScoped.push(CommonMethods.getKeyReplacedString(aurl, params));
    }

    this.loggerService.debug(
      'whitelisted resolvedScoped --> ' + resolvedScoped,
    );

    if (this.checkScopesMatch(resolvedScoped, urlToValidate, checkAuthDto)) {
      return true;
    }

    return false;
  }
  async getUserRoleByUserHash(userDto: UserDto) {
    try {
      const user = this.userRoleRepo.findRolesByUserId(
        userDto.userHash,
        userDto.platform,
      );

      return user;
    } catch (error) {
      this.loggerService.error(
        'error while getting user role from userhash --> ' + error,
      );
      throw new Error(error);
    }
  }

  async getAccessTokenByRefreshToken(
    clientId: string,
    jwtRefreshToken: string,
  ) {
    let client;
    try {
      client = await firstValueFrom(
        this.authenticationService.send(
          {
            cmd: 'findClientById',
          },
          clientId,
        ),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    this.loggerService.debug('client --> ' + client);

    let decodedRefreshToken;
    try {
      decodedRefreshToken = this.jwtService.verify(jwtRefreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (e) {
      this.loggerService.error('error while decoding refresh token --> ' + e);
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1072'));
    }

    this.loggerService.debug(
      'decodedRefreshToken >> ' + JSON.stringify(decodedRefreshToken),
    );

    const refreshToken: IAuthRefreshToken =
      await this.authRefreshTokenService.findById(decodedRefreshToken.jti);

    this.loggerService.debug('refreshToken >> ' + refreshToken);

    this.validateAccessTokenRequest(refreshToken);

    await this.authAccessTokenService.deleteAccessTokenbyRefreshToken(
      refreshToken._id,
    );
    const accessToken = await this.generateAccessToken(
      refreshToken.userId,
      refreshToken.orgId,
      refreshToken._id,
      client,
    );

    await this.authRefreshTokenService.saveById(refreshToken._id, {
      lastUsedAt: Date.now(),
    });

    const tokens = await this.getClientJwtTokens(
      accessToken,
      refreshToken,
      client,
    );

    delete tokens['refreshToken'];

    return tokens;
  }

  validateAccessTokenRequest(refreshToken: IAuthRefreshToken) {
    if (!refreshToken)
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1027'));
    const timeWindow = ApplicationConstants.ATRegenerateExecutionTimeWindow;
    if (refreshToken.lastUsedAt + timeWindow * 1000 > Date.now())
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1028'));
  }

  async deleteUserSessionDetails(userId: string): Promise<boolean> {
    if (!userId) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1077'));
    }
    let userSessionDeleted = false;
    const accessTokenDeleted =
      await this.authAccessTokenService.deleteUserAccessToken(userId);
    if (accessTokenDeleted) {
      userSessionDeleted =
        await this.authRefreshTokenService.deleteUserRefreshToken(userId);
    }
    return userSessionDeleted;
  }

  async deleteUsersSessionDetails(userIds: string[]): Promise<boolean> {
    if (!userIds || userIds.length < 1) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1077'));
    }
    let usersSessionDeleted = false;
    const accessTokenDeleted =
      await this.authAccessTokenService.deleteUsersAccessToken(userIds);
    if (accessTokenDeleted) {
      usersSessionDeleted =
        await this.authRefreshTokenService.deleteUsersRefreshToken(userIds);
    }
    return usersSessionDeleted;
  }

  async signOut(clientId: string, authAccessToken: string) {
    //    let authClient;
    try {
      await firstValueFrom(
        this.authenticationService.send(
          {
            cmd: 'findClientById',
          },
          clientId,
        ),
      );
    } catch (error) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1002'));
    }
    let decoded;

    try {
      const jwt = authAccessToken?.split(' ')[1];
      decoded = this.jwtService.verify(jwt, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1073'));
    }

    const accessToken = await this.authAccessTokenService.getAccessToken(
      decoded.jti,
    );

    if (accessToken) {
      await this.deleteUserSessionDetails(accessToken.userId);
      return { accessToken: authAccessToken };
    }

    throw new ForbiddenException(CommonMethods.getSsoErrorMsg('SSO_1074'));
  }
  // group By permission
  async groupByPermissions(groupBy: string, plateformName?: string) {
    try {
      const result = await this.permissionService.groupByAllPermission(
        groupBy,
        plateformName,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  // find all roles
  async findAllRoles(query: any, platformName?: string) {
    try {
      const queryParams: any = {};
      if (platformName) {
        queryParams.platformName = platformName;
      }
      if (query) {
        Object.assign(queryParams, query);
      }
      const result = await this.roleService.findRoleByQuery(queryParams);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // create role
  async createRole(dto: CreateRoleDto) {
    try {
      const result = await this.roleService.createRole(dto);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  //patch role
  async updateRole(id: string, dto: Partial<CreateRoleDto>) {
    const result = await this.roleService.updateRoleById(id, dto);
    return result;
  }
  // Delete role
  async deleteRole(id: string) {
    const result = await this.roleService.deleteRoleById(id);
    return result;
  }
  // bulk Upload user-role
  async bulkUploadUserRoles(createUserRoleDto: CreateUserRoleDto[]) {
    const result =
      await this.userRoleService.createOrUpdateUserRoles(createUserRoleDto);
    return result;
  }

  async getUserRoleByQuery(query: any, platformName: string) {
    const result = await this.userRoleService.getAllUserRoles(
      query,
      platformName,
    );
    return result;
  }

  // bulk fetch user role
  async bulkFetchUserRoles(bulkFetchUserRole: BulkFetchUserRoleDto) {
    try {
      const { key, data, selectedFields } = bulkFetchUserRole;
      const profiles = await this.userRoleRepo.findAllUserRoles(
        key,
        data,
        selectedFields,
      );
      return profiles;
    } catch (err) {
      throw err;
    }
  }

  // bulk Upload roles
  async bulkUploadRoles(createRoleDto: CreateRoleDto[]) {
    const result =
      await this.roleService.bulkCreateOrUpdateRoles(createRoleDto);
    return result;
  }
  async deleteUserRoleByRoleId(query: any) {
    const result = await this.userRoleService.deleteUserRoleByQuery({
      ...query,
    });
    return result;
  }
  async groupByUsers(groupBy: string, platformName?: string) {
    try {
      const result = await this.userRoleService.groupByUsers(
        groupBy,
        platformName,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
