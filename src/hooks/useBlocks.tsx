import { BlockAPI } from "@/services/api/block.api";
import { useQuery } from "@tanstack/react-query";

export const useBlocksInPackages = (blockId: string) => {
  return useQuery({
    queryKey: ["blocks", blockId],
    queryFn: () => BlockAPI.getBlockInPackages(blockId),
    enabled: !!blockId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}