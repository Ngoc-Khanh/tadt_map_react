import type { IUploadFileDTO } from "@/data/dto";
import { UploadAPI } from "@/services/api/upload.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUploadFileToServer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IUploadFileDTO) => UploadAPI.uploadFileToServer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file-upload-list"] });
    },
  });
}

export const useFileListByProjectId = (projectId: string) => {
  return useQuery({
    queryKey: ["file-upload-list", projectId],
    queryFn: () => UploadAPI.getUploadListByProjectId(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};