export class CreateAuthAccessTokenDto {
  _id?: string;
  accessTokenExpiresAt: number;
  clientId: string;
  userId: string;
  refreshTokenId: string;
}

export class UpdatAuthClientDto implements Partial<CreateAuthAccessTokenDto> {}
