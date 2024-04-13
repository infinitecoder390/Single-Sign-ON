import { CommonMethods } from '@app/common/common-utils/common-methods';
import { IAuthClient } from '@app/common/interfaces/auth-client-interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthClientDto } from '../dto/auth-client.dto';
import { AuthClientRepo } from '../repository/auth-client.repo';

@Injectable()
export class AuthClientService {
  constructor(private readonly authClientRepo: AuthClientRepo) {}

  async createClient(
    createAuthClientDto: CreateAuthClientDto,
  ): Promise<IAuthClient> {
    const checkUserByName = await this.authClientRepo.findByClientName(
      createAuthClientDto.clientName,
    );

    if (checkUserByName) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1068'));
    }
    return await this.authClientRepo.create(createAuthClientDto);
  }

  async findById(clientId: string): Promise<IAuthClient> {
    const client = await this.authClientRepo.findById(clientId);
    if (!client) {
      throw new BadRequestException(CommonMethods.getSsoErrorMsg('SSO_1002'));
    }
    return client;
  }
}
