import type { IPackage } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { apiGet } from "@/services/api";

export const PackageAPI = {
  async getPackageList() {
    const res = await apiGet<SRO<IPackage[]>>("Maps/packages");
    return res.data;
  }
}