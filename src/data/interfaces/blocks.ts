import type { ETrangThaiType } from "@/data/enums";

export interface IBlock {
  package_id: string;
  ten_goi_thau: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  nha_thau?: string;
}
