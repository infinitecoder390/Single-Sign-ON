import { IAuthClient } from '@app/common/interfaces/auth-client-interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthClientDto } from '../dto/auth-client.dto';

@Injectable()
export class AuthClientRepo {
  constructor(
    @InjectModel('AuthClient')
    private readonly model: Model<IAuthClient>,
  ) {}

  async findByClientName(clientName: string): Promise<IAuthClient> {
    return this.model.findOne({ clientName }).exec();
  }
  async findById(id: string): Promise<IAuthClient> {
    return await this.model.findById(id).exec();
  }

  async create(dto: CreateAuthClientDto): Promise<IAuthClient> {
    const client = await new this.model(dto);
    return client.save();
  }

  async saveById(
    id: string,
    dto: Partial<CreateAuthClientDto>,
  ): Promise<IAuthClient> {
    const existing = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return existing;
  }
}
