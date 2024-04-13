import { IAuthAccessToken } from '@app/common/interfaces/auth-access-token.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthAccessTokenDto } from '../dto/auth-access-token.dto';

@Injectable()
export class AuthAccessTokenRepo {
  constructor(
    @InjectModel('AuthAccessToken')
    private readonly model: Model<IAuthAccessToken>,
  ) {}

  async findById(id: string): Promise<IAuthAccessToken> {
    return this.model.findById({ id }).exec();
  }

  async create(dto: CreateAuthAccessTokenDto): Promise<IAuthAccessToken> {
    const token = await new this.model(dto);
    return token.save();
  }

  async saveById(
    id: string,
    dto: Partial<CreateAuthAccessTokenDto>,
  ): Promise<IAuthAccessToken> {
    const existing = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return existing;
  }
}
