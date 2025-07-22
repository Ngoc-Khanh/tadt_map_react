import type { SavePlanningAreaDto, SavePlanningAreaZoneDto } from "@/data/dto";
import { PlanningAreaAPI } from "@/services/api/planning-area.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePlanningAreaList = (projectId: string) => {
  return useQuery({
    queryKey: ['planning-area', projectId],
    queryFn: () => PlanningAreaAPI.getPlanningAreaList(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

export const useSavePlanningArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SavePlanningAreaDto) => PlanningAreaAPI.savePlanningArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-area'] })
    }
  })
}

export const useSavePlanningAreaZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SavePlanningAreaZoneDto) => PlanningAreaAPI.savePlanningAreaZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-area'] })
    }
  })
}

export const useDeleteZoneInPlanningArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: string) => PlanningAreaAPI.deleteZoneInPlanningArea(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-area'] })
    }
  })
}

export const useDeleteBlockInPlanningArea = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => PlanningAreaAPI.deleteBlockInPlanningArea(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning-area'] })
    }
  })
}