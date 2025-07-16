import type { SRO } from "@/data/sro";

export const APIResponse = <T>(response: SRO<T>): T => {
  if (response.IsSuccess && response.Data) return response.Data;
  throw new Error(response.ErrorMessage || "Unknown error occurred");
}