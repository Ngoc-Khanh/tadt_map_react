import type { ETrangThaiType } from "@/data/enums";

export interface IProject {
  project_id: string;
  ten_du_an: string;
  trang_thai: ETrangThaiType;
  ngay_cap_nhat: string;
  tien_do_thuc_te: number;
  anh_tong_quan: string;
  ngay_bd_ke_hoach: string;
  ngay_kt_ke_hoach: string;
}

export interface IProjectDetail {
  project_id: string;
  ten_du_an: string;
  trang_thai: ETrangThaiType;
  ngay_cap_nhat: string;
  tien_do_thuc_te: number;
  anh_tong_quan: string;
  ngay_bd_ke_hoach: string;
  ngay_kt_ke_hoach: string;
}
