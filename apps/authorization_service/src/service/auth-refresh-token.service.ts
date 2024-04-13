import { IAuthRefreshToken } from '@app/common/interfaces/auth-refresh-token.interface';
import { Injectable } from '@nestjs/common';
import {
  CreateAuthRefreshTokenDto,
  UpdateAuthRefreshTokenDto,
} from '../dto/auth-refresh-token.dto';
import { AuthRefreshTokenRepo } from '../repository/auth-refresh-token.repo';

@Injectable()
export class AuthRefreshTokenService {
  constructor(private readonly repo: AuthRefreshTokenRepo) {}

  async create(dto: CreateAuthRefreshTokenDto): Promise<IAuthRefreshToken> {
    return await this.repo.create(dto);
  }

  async findById(id: string): Promise<IAuthRefreshToken> {
    const token = await this.repo.findById(id);
    return token;
  }

  async saveById(
    id: string,
    dto: UpdateAuthRefreshTokenDto,
  ): Promise<IAuthRefreshToken> {
    return await this.repo.saveById(id, dto);
  }

  async deleteUserRefreshToken(id: string): Promise<boolean> {
    return await this.repo.deleteUserRefreshToken(id);
  }

  async deleteUsersRefreshToken(ids: string[]): Promise<boolean> {
    return await this.repo.deleteUsersRefreshToken(ids);
  }
}
