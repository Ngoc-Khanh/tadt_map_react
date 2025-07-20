import type { IProject, IProjectDetail } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const ProjectAPI = {
  async getProjectList(): Promise<IProject[]> {
    const res = await apiGet<SRO<IProject[]>>("/c360/project/list");
    return APIResponse(res.data);
  },

  async getProjectDetailById(projectId: string) {
    const res = await apiGet<SRO<IProjectDetail>>(`/c360/project/detail/${projectId}`);
    return res.data;
  },
};