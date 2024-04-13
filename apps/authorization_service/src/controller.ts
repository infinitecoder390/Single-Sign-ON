import { SuccessResponseDto } from '@app/common/dtos/success-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { CheckAuthDto } from './dto/check-auth.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthorizationService } from './service';
import { UserDto } from './dto/user.dto';
import { CreateRoleDto } from './dto/roles.dto';
import { CreateUserRoleDto } from './dto/user-roles.dto';
import { Public } from '@app/common/decorators';
import { BulkFetchUserRoleDto } from './dto/bulk-fetch-user-role.dto';

@Controller({
  version: '1',
  path: '/',
})
export class AuthorizationServiceController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get()
  getHello(): string {
    return this.authorizationService.getHello();
  }

  @Public()
  @Post('/access-token')
  @HttpCode(HttpStatus.OK)
  async accessToken(
    @Headers('client_id') clientId: string,
    @Body() dto: LoginRequestDto,
  ) {
    const result = await this.authorizationService.getAccessToken(
      dto,
      clientId,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Access and Refresh token generated successfuly.',
    );
  }

  @Public()
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Headers('client_id') clientId: string,
    @Headers('refreshToken') refreshToken: string,
  ) {
    const result = await this.authorizationService.getAccessTokenByRefreshToken(
      clientId,
      refreshToken,
    );

    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Access token generated successfuly.',
    );
  }

  @Public()
  @Post('/sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Headers('client_id') clientId: string,
    @Headers('Authorization') authAccessToken: string,
  ) {
    const result = await this.authorizationService.signOut(
      clientId,
      authAccessToken,
    );

    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Sign out successfuly.',
    );
  }

  @Public()
  @Post('/check-authorization')
  @HttpCode(HttpStatus.OK)
  async checkAuthorization(
    @Body() checkAuthDto: CheckAuthDto,
  ): Promise<boolean> {
    return await this.authorizationService.checkAuthorization(checkAuthDto);
  }

  @Get('/user')
  @HttpCode(HttpStatus.OK)
  async getUserRoleByUserHash(@Query() userDto: UserDto) {
    const user = await this.authorizationService.getUserRoleByUserHash(userDto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      user,
      'User data fetched successfully.',
    );
  }
  // group by permission set ...
  @Get('/permissions')
  @HttpCode(HttpStatus.OK)
  async groupPermission(
    @Query('groupBy') groupBy: string,
    @Query('platformName') platformName?: string,
  ) {
    const result = await this.authorizationService.groupByPermissions(
      groupBy,
      platformName,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Permission fetched successfully.',
    );
  }

  // get all roles ...
  @Get('/roles')
  @HttpCode(HttpStatus.OK)
  async findRoles(
    @Query('query') query: any,
    @Query('platformName') platformName?: string,
  ) {
    const result = await this.authorizationService.findAllRoles(
      query,
      platformName,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Roles fetched successfully.',
    );
  }

  // roles bulk upload
  @Post('/roles/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkUploadRoles(@Body() createRoleDto: CreateRoleDto[]) {
    const result =
      await this.authorizationService.bulkUploadRoles(createRoleDto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Roles created successfully.',
    );
  }

  // post role
  @Post('/roles')
  @HttpCode(HttpStatus.OK)
  async createRole(@Body() dto: CreateRoleDto) {
    const result = await this.authorizationService.createRole(dto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Role created successfully.',
    );
  }
  // patch role
  @Patch('/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() dto: Partial<CreateRoleDto>,
  ) {
    const result = await this.authorizationService.updateRole(roleId, dto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Role updated successfully.',
    );
  }

  // delete role
  @Delete('/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('roleId') roleId: string) {
    const result = await this.authorizationService.deleteRole(roleId);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Role Deleted successfully.',
    );
  }

  // user roles bulk upload
  @Post('/user-roles/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkUploadUserRole(@Body() createUserRoleDto: CreateUserRoleDto[]) {
    const result =
      await this.authorizationService.bulkUploadUserRoles(createUserRoleDto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'User roles created successfully.',
    );
  }
  // delete user role by query
  @Delete('/user-roles')
  @HttpCode(HttpStatus.OK)
  async deleteUserRoleByQuery(@Query('query') query: any) {
    const result =
      await this.authorizationService.deleteUserRoleByRoleId(query);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Role Deleted successfully.',
    );
  }

  // get user role by query
  @Get('/user-roles')
  @HttpCode(HttpStatus.OK)
  async getUserRoleByQuery(
    @Query('query') query: any,
    @Query('platformName') platformName: string,
  ) {
    const result = await this.authorizationService.getUserRoleByQuery(
      query,
      platformName,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Roles fetched successfully.',
    );
  }

  // get user role from userhash array
  @Get('bulk-fetch/user-roles')
  @HttpCode(HttpStatus.OK)
  async bulkFetchUserRoles(@Query() bulkFetchRoleDto: BulkFetchUserRoleDto) {
    const result =
      await this.authorizationService.bulkFetchUserRoles(bulkFetchRoleDto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Roles fetched successfully.',
    );
  }

  @Get('/users')
  @HttpCode(HttpStatus.OK)
  async groupUsers(
    @Query('groupBy') groupBy: string,
    @Query('platformName') platformName?: string,
  ) {
    const result = await this.authorizationService.groupByUsers(
      groupBy,
      platformName,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      result,
      'Users fetched successfully.',
    );
  }

  @MessagePattern({ cmd: 'deleteUserSessionDetails' })
  async deleteUserSessionDetails(userId: string): Promise<boolean> {
    try {
      return await this.authorizationService.deleteUserSessionDetails(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'deleteUsersSessionDetails' })
  async deleteUsersSessionDetails(userIds: string[]): Promise<boolean> {
    try {
      return await this.authorizationService.deleteUsersSessionDetails(userIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
