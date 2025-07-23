export interface ILoginCredentials {
  Status: number;
  ExtendCode: string;
  Token: string;
  RefreshToken: string;
  ErrorMessage: string | null;
}