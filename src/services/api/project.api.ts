import type { IBlock, IProject, IProjectDetail, IZone } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const ProjectAPI = {
  async getProjectList(): Promise<IProject[]> {
    const res = await apiGet<SRO<IProject[]>>("Maps/projects");
    return APIResponse(res.data);
  },

  async getProjectById(projectId: string): Promise<IProjectDetail[]> {
    if (!projectId) throw new Error('Project ID is required');
    const res = await apiGet<SRO<IProjectDetail[]>>(`Maps/projects/${projectId}`);
    return APIResponse(res.data);
  },

  async getZonesInProject(projectId: string): Promise<IZone[]> {
    if (!projectId) throw new Error('Project ID is required');
    const res = await apiGet<SRO<IZone[]>>(`Maps/projects/${projectId}/zones`);
    return APIResponse(res.data);
  },

  async getBlocksInProject(projectId: string): Promise<IBlock[]> {
    if (!projectId) throw new Error('Project ID is required');
    const res = await apiGet<SRO<IBlock[]>>(`Maps/projects/${projectId}/blocks`);
    return APIResponse(res.data);
  }
}