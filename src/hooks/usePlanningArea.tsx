import { PlanningAreaAPI } from "@/services/api/lanning-area.api";
import { useQuery } from "@tanstack/react-query";

export const usePlanningAreaList = (projectId: string) => {
  return useQuery({
    queryKey: ['planning-area', projectId],
    queryFn: () => PlanningAreaAPI.getPlanningAreaList(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}