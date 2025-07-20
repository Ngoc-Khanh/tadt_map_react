export type SRO<T = unknown> = {
  success: boolean;
  message: string;
  code: number;
  data: T;
}