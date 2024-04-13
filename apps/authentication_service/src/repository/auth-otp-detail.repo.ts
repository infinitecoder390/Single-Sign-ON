import { IAuthOtpDetail } from '@app/common/interfaces/auth-otp-detail.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateAuthOtpDetailDto,
  UpdatAuthOtpDetailDto,
} from '../dto/auth-otp-detail.dto';

@Injectable()
export class AuthOtpDetailRepo {
  constructor(
    @InjectModel('AuthOtpDetail')
    private readonly model: Model<IAuthOtpDetail>,
  ) {}

  async findByEmail(email: string): Promise<IAuthOtpDetail> {
    return await this.model.findOne({ email }).exec();
  }

  async findByPhone(
    phone: string,
    countryCode: string,
  ): Promise<IAuthOtpDetail> {
    return await this.model.findOne({ countryCode, phone }).exec();
  }

  async findByRefId(refId: string): Promise<IAuthOtpDetail> {
    return await this.model.findOne({ refId }).exec();
  }

  async deleteById(id: string) {
    return await this.model.deleteOne({ _id: id }).exec();
  }

  async create(dto: CreateAuthOtpDetailDto): Promise<IAuthOtpDetail> {
    const store = await this.model.create(dto);
    return store.save();
  }

  async saveById(
    id: string,
    dto: UpdatAuthOtpDetailDto,
  ): Promise<IAuthOtpDetail> {
    const existing = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return existing;
  }
}
