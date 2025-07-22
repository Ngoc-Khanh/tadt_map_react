import { BLockAPI } from "@/services/api/block.api";
import { useQuery } from "@tanstack/react-query";

export const useBlockListByZoneId = (zoneId: string) => {
  return useQuery({
    queryKey: ["blocks", zoneId],
    queryFn: () => BLockAPI.getBlockListByZoneId(zoneId),
    enabled: !!zoneId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

