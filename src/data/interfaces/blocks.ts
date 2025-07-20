import type { ETrangThaiType } from "@/data/enums";

export interface IBlock {
  block_id: string;
  ten_block: string;
  zone_id: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
}
