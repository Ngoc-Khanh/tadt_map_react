import type { SRO } from "@/data/sro";

export const APIResponse = <T>(response: SRO<T>): T => {
  if (response.success && response.data) return response.data;
  throw new Error(response.message || "Unknown error occurred");
}