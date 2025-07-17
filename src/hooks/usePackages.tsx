import { PackageAPI } from "@/services/api/package.api";
import { useQuery } from "@tanstack/react-query";
import type { IPackage } from '@/data/interfaces';
import { useState, useEffect } from 'react';

export const usePackagesList = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: PackageAPI.getPackageList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function usePackages() {
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data nếu API chưa sẵn sàng
      const mockPackages: IPackage[] = [
        {
          package_id: "PKG001",
          ten_goi_thau: "Gói thầu xây dựng hạ tầng",
          trang_thai: "Đang thực hiện",
          tien_do_thuc_te: 75,
          nha_thau: "Công ty TNHH Xây dựng ABC"
        },
        {
          package_id: "PKG002", 
          ten_goi_thau: "Gói thầu thi công đường",
          trang_thai: "Chờ thực hiện",
          tien_do_thuc_te: 30,
          nha_thau: "Công ty CP Đầu tư XYZ"
        },
        {
          package_id: "PKG003",
          ten_goi_thau: "Gói thầu hoàn thiện",
          trang_thai: "Mới tạo",
          tien_do_thuc_te: 0
        }
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPackages(mockPackages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải gói thầu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    packages,
    isLoading,
    error,
    refetch: fetchPackages
  };
}