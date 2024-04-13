import { IAuthPkce } from '@app/common/interfaces/auth-pkce.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthPkceDto } from '../dto/auth-pkce.dto';

@Injectable()
export class AuthPkceRepo {
  constructor(
    @InjectModel('AuthPkce')
    private readonly model: Model<IAuthPkce>,
  ) {}

  async findById(id: string): Promise<IAuthPkce> {
    return this.model.findById({ id }).exec();
  }

  async findByCode(code: string): Promise<IAuthPkce> {
    return this.model.findOne({ code }).exec();
  }
  async deleteById(id: string) {
    return await this.model.deleteOne({ _id: id }).exec();
  }
  async create(dto: CreateAuthPkceDto): Promise<IAuthPkce> {
    const pkce = await new this.model(dto);
    return pkce.save();
  }
  async saveById(
    id: string,
    dto: Partial<CreateAuthPkceDto>,
  ): Promise<IAuthPkce> {
    const existingPkce = await this.model.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return existingPkce;
  }
}
