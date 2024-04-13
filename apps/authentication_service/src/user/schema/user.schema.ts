import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as crypto from 'crypto';

@Schema({ collection: 'auth_user', timestamps: true })
export class User extends Document {
  @Prop({ type: String })
  _id: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  phone: string;

  @Prop()
  countryCode: string;

  @Prop()
  userRole: string;

  @Prop()
  userGroup: string;

  @Prop()
  isActive: boolean;

  @Prop()
  orgId: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ required: false })
  department?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  this._id = crypto.createHash('sha256').update(this.phone).digest('hex');
  this.isActive = true;
  next();
});
