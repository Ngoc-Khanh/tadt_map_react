import type { IPackage } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet } from "@/services/api";

export const PackageAPI = {
  async getPackageList(): Promise<IPackage[]> {
    const res = await apiGet<SRO<IPackage[]>>("Maps/packages");
    return APIResponse(res.data);
  }
}