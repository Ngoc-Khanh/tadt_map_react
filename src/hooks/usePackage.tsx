import { PackageAPI } from "@/services/api/package.api";
import { useQuery } from "@tanstack/react-query";

export const usePackageListByBlockId = (blockId: string) => {
  return useQuery({
    queryKey: ["packages", blockId],
    queryFn: () => PackageAPI.getPackageListByBlockId(blockId),
    enabled: !!blockId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};