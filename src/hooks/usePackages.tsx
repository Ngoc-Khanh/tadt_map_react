import { PackageAPI } from "@/services/api/package.api";
import { useQuery } from "@tanstack/react-query";

export const usePackagesList = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: PackageAPI.getPackageList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}