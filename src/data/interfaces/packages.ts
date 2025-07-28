import type { ETrangThaiType } from "@/data/enums";

export interface IPackage {
  package_id: string;
  ten_goi_thau: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  tien_do_ke_hoach: number;
  ngay_bd_ke_hoach: string | null;
  ngay_kt_ke_hoach: string | null;
  nha_thau: string | null;
  block_map_id: string | null;
  anh_thuc_te: string | null;
}

export interface IPackageDetail {
  package_id: string;
  ten_goi_thau: string;
  zone_id: string;
  project_id: string;
  nha_thau: string;
  ngay_bd_ke_hoach: string | null;
  ngay_kt_ke_hoach: string | null;
  ngay_bd_thuc_te: string | null;
  ngay_kt_thuc_te: string | null;
  chi_phi: number | null;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  tien_do_ke_hoach: number;
  vuong_mac: string | null;
  chi_dao: string | null;
  anh_tong_quan: string | null;
  anh_thuc_te: string | null;
  anh_thuc_te_lat: string | null;
  anh_thuc_te_lng: string | null;
  ngay_cap_nhat: string;
  block_map_id: string | null;
}