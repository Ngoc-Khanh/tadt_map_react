import type { ETrangThaiType } from "@/data/enums";

export interface IZone {
  zone_id: string;
  ten_phan_khu: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
}

export interface IZoneDetail extends IZone {
  project_id: string;
  ngay_bd_ke_hoach: string;
  ngay_kt_ke_hoach: string;
  tien_do_ke_hoach: number;
  ngay_cap_nhat: string;
}
