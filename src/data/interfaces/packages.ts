export interface IPackage {
  package_id: string;
  ten_goi_thau: string;
  trang_thai: string;
  tien_do_thuc_te: number;
  tien_do_ke_hoach: number;
  ngay_bd_ke_hoach: string | null;
  ngay_kt_ke_hoach: string | null;
  nha_thau: string | null;
  block_map_id: string | null;
  anh_thuc_te: string | null;
}
