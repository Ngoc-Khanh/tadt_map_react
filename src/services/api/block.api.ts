import type { IProjectBlock } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const BlockAPI = {
  async getBlockInPackages(blockId: string): Promise<IProjectBlock[]> {
    if (!blockId) throw new Error("Block ID is required");
    const res = await apiGet<SRO<IProjectBlock[]>>(`Maps/blocks/${blockId}/packages`);
    return APIResponse(res.data);
  }
}