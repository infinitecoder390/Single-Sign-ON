import { IAuthPkce } from '@app/common/interfaces/auth-pkce.interface';
import { Injectable } from '@nestjs/common';
import { CreateAuthPkceDto } from '../dto/auth-pkce.dto';
import { AuthPkceRepo } from '../repository/auth-pkce.repo';

@Injectable()
export class AuthPkceService {
  constructor(private readonly authPkceStoreRepo: AuthPkceRepo) {}

  async findByCode(code: string): Promise<IAuthPkce> {
    return await this.authPkceStoreRepo.findByCode(code);
  }

  async create(authPkceStore: CreateAuthPkceDto): Promise<IAuthPkce> {
    return await this.authPkceStoreRepo.create(authPkceStore);
  }
  async deleteById(id: string) {
    return await this.authPkceStoreRepo.deleteById(id);
  }

  async saveById(
    id: string,
    authPkceStore: Partial<CreateAuthPkceDto>,
  ): Promise<IAuthPkce> {
    return await this.authPkceStoreRepo.saveById(id, authPkceStore);
  }
}
