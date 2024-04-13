import { Document } from 'mongoose';

export interface IUser extends Document {
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  password: string;
  phone: string;
  countryCode: string;
  email: string;
  createdByclientId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  orgId: string;
}
