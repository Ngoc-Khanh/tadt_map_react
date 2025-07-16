import type { IZone, IZoneBlock, IZoneDetail } from "@/data/interfaces"
import type { SRO } from "@/data/sro"
import { APIResponse } from "@/lib/api-response"
import { apiGet } from "@/services/api"

export const ZoneAPI = {
  async getZoneList(): Promise<IZone[]> {
    const res = await apiGet<SRO<IZone[]>>("Maps/zones")
    return APIResponse(res.data);
  },

  async getZoneDetailById(zoneId: string): Promise<IZoneDetail[]> {
    if (!zoneId) throw new Error('Zone ID is required');
    const res = await apiGet<SRO<IZoneDetail[]>>(`Maps/zones/${zoneId}`)
    return APIResponse(res.data);
  },

  async getZonesInBlock(zoneId: string): Promise<IZoneBlock[]> {
    if (!zoneId) throw new Error('Zone ID is required');
    const res = await apiGet<SRO<IZoneBlock[]>>(`Maps/zones/${zoneId}/blocks`)
    return APIResponse(res.data);
  }
}