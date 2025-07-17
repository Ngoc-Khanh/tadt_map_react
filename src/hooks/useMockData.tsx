import { addGeometryToBlocks } from "@/data/mock/blockMock";
import { addGeometryToZones } from "@/data/mock/zoneMock";
import { ProjectAPI } from "@/services/api/project.api";
import { useQuery } from "@tanstack/react-query";

export const useZoneWithGeometryInProject = (projectId: string) => {
  return useQuery({
    queryKey: ['zonesWithGeometry', projectId],
    queryFn: async () => {
      const apiData = await ProjectAPI.getZonesInProject(projectId);
      return addGeometryToZones(apiData);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useBlockWithGeometryInProject = (projectId: string) => {
  return useQuery({
    queryKey: ['blocksWithGeometry', projectId],
    queryFn: async () => {
      const apiData = await ProjectAPI.getBlocksInProject(projectId);
      return addGeometryToBlocks(apiData);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}