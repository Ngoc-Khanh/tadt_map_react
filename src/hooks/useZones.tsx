import { ZoneAPI } from "@/services/api/zone.api";
import { useQuery } from "@tanstack/react-query";

export const useZoneListByProjectId = (projectId: string) => {
  return useQuery({
    queryKey: ['zones', projectId],
    queryFn: () => ZoneAPI.getZoneListByProjectId(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}