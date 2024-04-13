import { IAuthOtpDetail } from '@app/common/interfaces/auth-otp-detail.interface';
import { Injectable } from '@nestjs/common';
import {
  CreateAuthOtpDetailDto,
  UpdatAuthOtpDetailDto,
} from '../dto/auth-otp-detail.dto';
import { LoggerService } from '../logger/logger.service';
import { AuthOtpDetailRepo } from '../repository/auth-otp-detail.repo';

@Injectable()
export class AuthOtpDetailService {
  constructor(
    private readonly authOtpDetailStoreRepo: AuthOtpDetailRepo,
    private readonly loggerService: LoggerService,
  ) {}

  async findByEmail(email: string): Promise<IAuthOtpDetail> {
    return await this.authOtpDetailStoreRepo.findByEmail(email);
  }

  async findByPhone(
    phone: string,
    countryCode: string,
  ): Promise<IAuthOtpDetail> {
    return await this.authOtpDetailStoreRepo.findByPhone(phone, countryCode);
  }

  async findByRefId(refId: string): Promise<IAuthOtpDetail> {
    return await this.authOtpDetailStoreRepo.findByRefId(refId);
  }

  async create(
    authOtpDetailStore: CreateAuthOtpDetailDto,
  ): Promise<IAuthOtpDetail> {
    return await this.authOtpDetailStoreRepo.create(authOtpDetailStore);
  }

  async saveById(
    id: string,
    authOtpDetailStore: UpdatAuthOtpDetailDto,
  ): Promise<IAuthOtpDetail> {
    this.loggerService.debug(
      `inside service id >> ${id}, dto >> ${authOtpDetailStore}`,
    );
    return await this.authOtpDetailStoreRepo.saveById(id, authOtpDetailStore);
  }

  async deleteById(id: string) {
    return await this.authOtpDetailStoreRepo.deleteById(id);
  }

  async findByEmailOrPhone(
    email: string,
    phone: string,
    countryCode: string,
  ): Promise<IAuthOtpDetail> {
    if (email) {
      return await this.findByEmail(email);
    } else if (phone) {
      return await this.findByPhone(countryCode, phone);
    }
  }
}
