import { Document } from 'mongoose';

export interface IAuthRefreshToken extends Document {
  refreshTokenExpiresAt: number;

  clientId: string;

  userId: string;

  lastUsedAt: number;

  orgId: string;
}
