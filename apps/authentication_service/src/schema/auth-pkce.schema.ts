import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ collection: 'auth_pkce', timestamps: true })
export class AuthPkce {
  @Prop({ default: () => uuidv4(), type: String })
  _id: string;

  @Prop()
  code: string;

  @Prop()
  clientId: string;

  @Prop({ nullable: true })
  email: string;

  @Prop({ nullable: true })
  phone: string;

  @Prop({ nullable: true })
  countryCode: string;

  @Prop({ nullable: true })
  codeChallenge: string;

  @Prop()
  expiryDateTime: number;
}
export const AuthPkceSchema = SchemaFactory.createForClass(AuthPkce);
