import { ProjectAPI } from "@/services/api/project.api"
import { useQuery } from "@tanstack/react-query"

export const useProjectsList = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: ProjectAPI.getProjectList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useProjectsDetail = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectAPI.getProjectById(projectId),
    select: (data) => Array.isArray(data) && data.length > 0 ? data[0] : null,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useZonesInProject = (projectId: string) => {
  return useQuery({
    queryKey: ['zones', projectId],
    queryFn: () => ProjectAPI.getZonesInProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useBlocksInProject = (projectId: string) => {
  return useQuery({
    queryKey: ['blocks', projectId],
    queryFn: () => ProjectAPI.getBlocksInProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}