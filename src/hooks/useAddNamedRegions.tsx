import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectAPI } from '@/services/api/project.api';
import type { Feature, Geometry, GeoJsonProperties } from 'geojson';

interface AddNamedBlocksPayload {
  projectId: string;
  namedBlocks: Array<{ name: string; geometry: Feature<Geometry, GeoJsonProperties> }>;
}

export function useAddNamedBlocksToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, namedBlocks }: AddNamedBlocksPayload) => {
      return await ProjectAPI.addNamedBlocksToProject(projectId, namedBlocks);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch project blocks data
      queryClient.invalidateQueries({ 
        queryKey: ['project-blocks', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['project-detail', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['project-zones', variables.projectId] 
      });
    },
    onError: (error) => {
      console.error('Failed to add named blocks to project:', error);
    },
  });
}