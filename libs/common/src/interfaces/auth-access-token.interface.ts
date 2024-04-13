import { Document } from 'mongoose';

export interface IAuthAccessToken extends Document {
  accessTokenExpiresAt: number;
  clientId: string;
  userId: string;
  refreshTokenId: string;
  orgId: string;
}
