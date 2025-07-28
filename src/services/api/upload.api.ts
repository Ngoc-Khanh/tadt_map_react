import type { IUploadFileDTO } from "@/data/dto";
import type { IUpload } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { APIResponse } from "@/lib/api-response";
import { apiGet, apiPost } from "@/services/api";

export const UploadAPI = {
  async uploadFileToServer(dto: IUploadFileDTO) {
    const res = await apiPost<IUploadFileDTO, SRO<string>>("/upload", dto);
    return APIResponse(res.data);
  },

  async getUploadListByProjectId(projectId: string): Promise<IUpload> {
    if (!projectId) throw new Error("Project ID is required");
    const res = await apiGet<SRO<IUpload>>(
      `/upload/list?page=1&size=100&projectId=${projectId}`
    );
    return APIResponse(res.data);
  },
};
