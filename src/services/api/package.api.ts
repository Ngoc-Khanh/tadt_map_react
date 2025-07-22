import type { IPackage } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const PackageAPI = {
  async getPackageListByBlockId(blockId: string): Promise<IPackage[]> {
    const res = await apiGet<SRO<IPackage[]>>(`/c360/package/list-by-block/${blockId}`);
    return APIResponse(res.data);
  },
}