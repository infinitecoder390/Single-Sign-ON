import { Document } from 'mongoose';

export interface IAuthAudit extends Document {
  clientId: string;
  userId: string;
  orgId: string;
}
