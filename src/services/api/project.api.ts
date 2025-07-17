import type { IBlock, IProject, IProjectDetail, IZone } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet, apiPost } from "@/services/api";
import type { Feature } from 'geojson';

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
  },

  async addNamedBlocksToProject(projectId: string, namedBlocks: Array<{ name: string, geometry: Feature }>): Promise<boolean> {
    if (!projectId) throw new Error('Project ID is required');
    if (!namedBlocks || namedBlocks.length === 0) throw new Error('Named blocks are required');
    
    const payload = {
      projectId,
      namedBlocks: namedBlocks.map(block => ({
        name: block.name,
        geometry: block.geometry
      }))
    };
    
    const res = await apiPost<typeof payload, SRO<boolean>>(`Maps/projects/${projectId}/named-blocks`, payload);
    return APIResponse(res.data);
  }
}