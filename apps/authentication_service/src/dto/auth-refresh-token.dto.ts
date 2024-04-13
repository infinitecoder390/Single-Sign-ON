export class CreateAuthRefreshTokenDto {
  _id?: string;
  refreshTokenExpiresAt: number;
  clientId: string;
  userId: string;
  lastUsedAt: number;
}

export class UpdatAuthClientDto implements Partial<CreateAuthRefreshTokenDto> {}
