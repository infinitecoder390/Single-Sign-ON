import { CommonMethods } from '@app/common/common-utils/common-methods';
import { IUser } from '@app/common/interfaces/user.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepo } from '../repository/user.repo';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepo: UserRepo,
  ) {}

  async findByPhone(phone: string, countryCode: string): Promise<IUser> {
    return await this.userRepo.findByPhone(phone, countryCode);
  }

  async findByEmail(email: string): Promise<IUser> {
    this.loggerService.debug('finding user by email ' + email);
    const user = await this.userRepo.findByEmail(email);
    this.loggerService.debug('user = ' + user);
    return user;
  }

  async findByEmailOrPhone(
    email: string,
    phone: string,
    countryCode: string,
  ): Promise<IUser> {
    if (email) {
      return await this.findByEmail(email);
    } else if (phone) {
      return await this.findByPhone(phone, countryCode);
    } else {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1069'));
    }
  }

  validateUser(user: IUser) {
    if (!user) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1030'));
    }
  }
}
