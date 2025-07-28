import type { EFileTypeType } from "@/data/enums";

export interface IUpload {
  count: number;
  files: IFileUpload[];
}

export interface IFileUpload {
  id: number;
  project_id: string;
  file_name: string;
  file_type: EFileTypeType;
  file_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}