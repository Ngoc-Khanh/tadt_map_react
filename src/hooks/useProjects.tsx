import { ProjectAPI } from "@/services/api/project.api"
import { useQuery } from "@tanstack/react-query"

export const useProjectsList = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: ProjectAPI.getProjectList,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useProjectsDetail = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectAPI.getProjectDetailById(projectId),
    select: (data) => Array.isArray(data) && data.length > 0 ? data[0] : null,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}