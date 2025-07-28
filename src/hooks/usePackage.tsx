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

export const usePackageDetail = (packageId: string) => {
  return useQuery({
    queryKey: ["package", packageId],
    queryFn: () => PackageAPI.getPackageDetail(packageId),
    select: (data) => Array.isArray(data) && data.length > 0 ? data[0] : null,
    enabled: !!packageId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}