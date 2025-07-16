import { ZoneAPI } from "@/services/api/zone.api";
import { useQuery } from "@tanstack/react-query";

export const useZoneList = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: ZoneAPI.getZoneList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export const useZoneDetail = (zoneId: string) => {
  return useQuery({
    queryKey: ['zone', zoneId],
    queryFn: () => ZoneAPI.getZoneDetailById(zoneId),
    select: (data) => Array.isArray(data) && data.length > 0 ? data[0] : null,
    enabled: !!zoneId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useZonesInBlock = (zoneId: string) => {
  return useQuery({
    queryKey: ['blocks', zoneId],
    queryFn: () => ZoneAPI.getZonesInBlock(zoneId),
    enabled: !!zoneId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}