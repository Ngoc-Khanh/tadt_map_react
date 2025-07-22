import type { SavePlanningAreaDto, SavePlanningAreaZoneDto } from "@/data/dto";
import type { IPlanningArea } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiDelete, apiGet, apiPost } from "@/services/api";

export const PlanningAreaAPI = {
  async getPlanningAreaList(projectId: string): Promise<IPlanningArea> {
    if (!projectId) throw new Error("Project ID is required");
    const res = await apiGet<SRO<IPlanningArea>>(`/planning-area/list?size=100&page=1&projectId=${projectId}`);
    return APIResponse(res.data);
  },

  async savePlanningArea(data: SavePlanningAreaDto): Promise<IPlanningArea> {
    const res = await apiPost<SavePlanningAreaDto, SRO<IPlanningArea>>(`/planning-area/save`, data);
    return APIResponse(res.data);
  },

  async savePlanningAreaZone(data: SavePlanningAreaZoneDto): Promise<IPlanningArea> {
    const res = await apiPost<SavePlanningAreaZoneDto, SRO<IPlanningArea>>(`/planning-area/save-project-zone`, data);
    return APIResponse(res.data);
  },

  async deleteZoneInPlanningArea(zoneId: string): Promise<boolean> {
    const res = await apiDelete<SRO<IPlanningArea>>(`/planning-area/zone/${zoneId}`);
    return res.data.success;
  },

  async deleteBlockInPlanningArea(blockId: string): Promise<boolean> {
    const res = await apiDelete<SRO<IPlanningArea>>(`/planning-area/block/${blockId}`);
    return res.data.success;
  },
}