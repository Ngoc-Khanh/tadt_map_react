import type { IBlock } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const BLockAPI = {
  async getBlockListByZoneId(zoneId: string): Promise<IBlock[]> {
    if (!zoneId) throw new Error("Zone ID is required");
    const res = await apiGet<SRO<IBlock[]>>(`/c360/block/list-by-zone/${zoneId}`);
    return APIResponse(res.data);
  },
}