import { IAuthRefreshToken } from '@app/common/interfaces/auth-refresh-token.interface';
import { Injectable } from '@nestjs/common';
import { CreateAuthRefreshTokenDto } from '../dto/auth-refresh-token.dto';
import { AuthRefreshTokenRepo } from '../repository/auth-refresh-token.repo';

@Injectable()
export class AuthRefreshTokenService {
  constructor(private readonly repo: AuthRefreshTokenRepo) {}

  async create(dto: CreateAuthRefreshTokenDto): Promise<IAuthRefreshToken> {
    return await this.repo.create(dto);
  }

  async saveById(
    id: string,
    dto: CreateAuthRefreshTokenDto,
  ): Promise<IAuthRefreshToken> {
    return await this.repo.saveById(id, dto);
  }
}
