import { IAuthRefreshToken } from '@app/common/interfaces/auth-refresh-token.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthRefreshTokenDto } from '../dto/auth-refresh-token.dto';

@Injectable()
export class AuthRefreshTokenRepo {
  constructor(
    @InjectModel('AuthRefreshToken')
    private readonly model: Model<IAuthRefreshToken>,
  ) {}

  async findById(id: string): Promise<IAuthRefreshToken> {
    return this.model.findById({ id }).exec();
  }

  async create(dto: CreateAuthRefreshTokenDto): Promise<IAuthRefreshToken> {
    const token = await new this.model(dto);
    return token.save();
  }

  async saveById(
    id: string,
    dto: Partial<CreateAuthRefreshTokenDto>,
  ): Promise<IAuthRefreshToken> {
    const existing = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return existing;
  }
}
