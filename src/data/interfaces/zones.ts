import type { ETrangThaiType } from "@/data/enums";

export interface IZone {
  zone_id: string;
  ten_phan_khu: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  block_map_id?: string;
}

export interface IZoneDetail {
  zone_id: string;
  ten_phan_khu: string;
  project_id: string;
  ngay_bd_ke_hoach: string;
  ngay_kt_ke_hoach: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  tien_do_ke_hoach: number;
  ngay_cap_nhat: string;
}

export interface IZoneBlock {
  block_id: string;
  ten_block: string;
  zone_id: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
}
