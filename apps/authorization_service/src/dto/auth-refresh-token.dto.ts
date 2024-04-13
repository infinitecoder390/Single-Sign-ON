import { PartialType } from '@nestjs/swagger';

export class CreateAuthRefreshTokenDto {
  _id?: string;
  refreshTokenExpiresAt: number;
  clientId: string;
  userId: string;
  orgId: string;
  lastUsedAt: number;
}

export class UpdateAuthRefreshTokenDto extends PartialType(
  CreateAuthRefreshTokenDto,
) {}
