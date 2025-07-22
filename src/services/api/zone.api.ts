import type { IZone } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const ZoneAPI = {
  async getZoneListByProjectId(projectId: string): Promise<IZone[]> {
    if (!projectId) throw new Error("Project ID is required");
    const res = await apiGet<SRO<IZone[]>>(`/c360/zone/list-by-project/${projectId}`);
    return APIResponse(res.data);
  },
};
