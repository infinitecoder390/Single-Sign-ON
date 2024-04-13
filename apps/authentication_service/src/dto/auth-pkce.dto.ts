export class CreateAuthPkceDto {
  public code: string;
  public email: string;
  public phone: string;
  public countryCode: string;
  public codeChallenge: string;
  public expiryDateTime: number;
  public clientId: string;
}
