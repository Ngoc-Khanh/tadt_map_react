import type { IProject, IProjectBlock, IProjectDetail, IProjectZone } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { apiGet } from "@/services/api";

export const ProjectAPI = {
  async getProjectList() {
    const res = await apiGet<SRO<IProject[]>>("Maps/projects");
    return res.data;
  },

  async getProjectById(projectId: string) {
    const res = await apiGet<SRO<IProjectDetail[]>>(`Maps/projects/${projectId}`);
    return res.data;
  },

  async getZonesInProject(projectId: string) {
    const res = await apiGet<SRO<IProjectZone[]>>(`Maps/projects/${projectId}/zones`);
    return res.data;
  },

  async getBlocksInProject(projectId: string) {
    const res = await apiGet<SRO<IProjectBlock[]>>(`Maps/projects/${projectId}/blocks`);
    return res.data;
  }
}