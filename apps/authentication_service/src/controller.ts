import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './service';
import { CreateAuthClientDto } from './dto/auth-client.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthClientService } from './service/auth-client.service';
import { LoggerService } from './logger/logger.service';
import { SuccessResponseDto } from '@app/common/dtos/success-response.dto';
import { ErrorResponseDto } from '@app/common/dtos/error-response.dto';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { IAuthClient } from '@app/common/interfaces/auth-client-interface';
import { AuthPkceService } from './service/auth-pkce.service';
import { IAuthPkce } from '@app/common/interfaces/auth-pkce.interface';
import { UserService } from './user/service/user.service';
import { IUser } from '@app/common/interfaces/user.interface';

@Controller({
  version: '1',
  path: '/',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authPkceService: AuthPkceService,
    private readonly authClientService: AuthClientService,
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {}

  @Post('/client')
  @HttpCode(HttpStatus.OK)
  createClient(@Body() createAuthClientDto: CreateAuthClientDto) {
    const clientCreationResult =
      this.authClientService.createClient(createAuthClientDto);
    return clientCreationResult
      .then((clientCreationResult) =>
        SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
          clientCreationResult,
          'Success in creating client',
        ),
      )
      .catch((e) =>
        ErrorResponseDto.getFilledResponseObjectAllArgs(
          null,
          e.message.split(':-')[1],
          e.message.split(':-')[0],
        ),
      );
  }

  @Post('/login')
  loginbyPhoneOrEmail(
    @Headers('client_id') clientId: string,
    @Body() loginRequestDto: LoginRequestDto,
  ) {
    return this.authService.loginbyPhoneOremail(loginRequestDto, clientId);
  }

  @Post('/access-token')
  accessToken(
    @Headers('client_id') clientId: string,
    @Body() loginRequestDto: LoginRequestDto,
  ) {
    return this.authService.getAccessToken(loginRequestDto, clientId);
  }

  @Post('/get-otp')
  @HttpCode(HttpStatus.OK)
  async checkEmail(
    @Headers('client_id') clientId: string,
    @Body() loginRequestDto: LoginRequestDto,
  ) {
    this.loggerService.debug('Client Id = ' + clientId);
    this.loggerService.debug(
      ' loginRequestDto = ' + loginRequestDto.countryCode,
    );
    const getOtpResult = await this.authService.getOtpSent(
      loginRequestDto,
      clientId,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      getOtpResult,
      'Verified',
    );
  }

  @Post('/resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Headers('client_id') clientId: string,
    @Body() loginRequestDto: LoginRequestDto,
  ) {
    this.loggerService.info('Client Id = ' + clientId);
    const getOtpResult = await this.checkEmail(clientId, loginRequestDto);
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      getOtpResult,
      'Otp successfully re-generated',
    );
  }

  @Post('/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Headers('client_id') clientId: string,
    @Body() loginRequestDto: LoginRequestDto,
  ) {
    const verifyOtpResult = await this.authService.verifyEmail(
      loginRequestDto,
      clientId,
    );
    return SuccessResponseDto.getFilledResponseObjectFromDataAndMessage(
      verifyOtpResult,
      'Otp successfully verified',
    );
  }

  @MessagePattern({ cmd: 'findClientById' })
  async findClientById(clientId: string): Promise<IAuthClient> {
    try {
      return await this.authClientService.findById(clientId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'findPkceByCode' })
  async findPkceByCode(code: string): Promise<IAuthPkce> {
    try {
      return await this.authPkceService.findByCode(code);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'deletePkceById' })
  async deletePkceById(id: string) {
    try {
      this.loggerService.info('deleting pkce by id= ' + id);

      return await this.authPkceService.deleteById(id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ cmd: 'findUserByEmailOrPhone' })
  async findUserByEmailOrPhone(dto: LoginRequestDto): Promise<IUser> {
    try {
      const usr = await this.userService.findByEmailOrPhone(
        dto.email,
        dto.phone,
        dto.countryCode,
      );

      this.loggerService.info('usr= ' + JSON.stringify(usr));

      return usr;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // @MessagePattern({ cmd: 'createAuthUserByAdmin' })
  // async createAuthUserByAdmin(createUserDto: CreateUserDto): Promise<IUser> {
  //   try {
  //     return await this.userService.createB2bAuthUser(createUserDto);
  //   } catch (error) {
  //     throw new RpcException(error.message);
  //   }
  // }
}
