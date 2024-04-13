import { IAuthAudit } from '@app/common/interfaces/auth-audit.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthAuditDto } from '../dto/auth-audit.dto';

@Injectable()
export class AuthAuditRepo {
  constructor(
    @InjectModel('AuthAudit')
    private readonly model: Model<IAuthAudit>,
  ) {}

  async create(dto: CreateAuthAuditDto): Promise<IAuthAudit> {
    const audit = await new this.model(dto);
    return audit.save();
  }
}
