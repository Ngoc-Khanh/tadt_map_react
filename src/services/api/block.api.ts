import type { IProjectBlock } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { apiGet } from "@/services/api";

export const BlockAPI = {
  async getBlockInPackages() {
    const res = await apiGet<SRO<IProjectBlock[]>>("Maps/blocks");
    return res.data;
  }
}