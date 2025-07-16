import type { IZone, IZoneDetail, IZoneBlock } from "@/data/interfaces"
import type { SRO } from "@/data/sro"
import { apiGet } from "@/services/api"

export const ZoneAPI = {
  async getZoneList() {
    const res = await apiGet<SRO<IZone[]>>("Maps/zones")
    return res.data
  },

  async getZoneDetailById(zoneId: string) {
    const res = await apiGet<SRO<IZoneDetail[]>>(`Maps/zones/${zoneId}`)
    return res.data
  },

  async getZonesInBlock(zoneId: string) {
    const res = await apiGet<SRO<IZoneBlock[]>>(`Maps/zones/${zoneId}/blocks`)
    return res.data
  }
}