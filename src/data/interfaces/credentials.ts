export interface ICredentialResponse {
  Status: number;
  ExtendCode: number;
  Token: string;
  RefreshToken: string;
  ErrorMessage: string | null;
}