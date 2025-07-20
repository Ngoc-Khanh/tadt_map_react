import type { IPlanningArea } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const PlanningAreaAPI = {
  async getPlanningAreaList(projectId: string): Promise<IPlanningArea> {
    if (!projectId) throw new Error("Project ID is required");
    const res = await apiGet<SRO<IPlanningArea>>(`/planning-area/list?size=100&page=1&projectId=${projectId}`);
    return APIResponse(res.data);
  }
}