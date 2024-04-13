import { IAuthAccessToken } from '@app/common/interfaces/auth-access-token.interface';
import { Injectable } from '@nestjs/common';
import { CreateAuthAccessTokenDto } from '../dto/auth-access-token.dto';
import { AuthAccessTokenRepo } from '../repository/auth-access-token.repo';

@Injectable()
export class AuthAccessTokenService {
  constructor(private readonly repo: AuthAccessTokenRepo) {}

  async create(
    authAccessTokenStore: CreateAuthAccessTokenDto,
  ): Promise<IAuthAccessToken> {
    return await this.repo.create(authAccessTokenStore);
  }

  async saveById(
    id: string,
    authAccessTokenStore: Partial<CreateAuthAccessTokenDto>,
  ): Promise<IAuthAccessToken> {
    return await this.repo.saveById(id, authAccessTokenStore);
  }
}
