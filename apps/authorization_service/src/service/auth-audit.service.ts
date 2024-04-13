import { IAuthAudit } from '@app/common/interfaces/auth-audit.interface';
import { Injectable } from '@nestjs/common';
import { CreateAuthAuditDto } from '../dto/auth-audit.dto';
import { AuthAuditRepo } from '../repository/auth-audit.repo';

@Injectable()
export class AuthAuditService {
  constructor(private readonly repo: AuthAuditRepo) {}

  async create(dto: CreateAuthAuditDto): Promise<IAuthAudit> {
    return await this.repo.create(dto);
  }
}
