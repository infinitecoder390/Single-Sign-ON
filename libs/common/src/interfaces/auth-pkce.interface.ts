import { Document } from 'mongoose';

export interface IAuthPkce extends Document {
  code: string;

  clientId;

  email: string;

  phone: string;

  countryCode: string;
  codeChallenge: string;

  expiryDateTime: number;
}
