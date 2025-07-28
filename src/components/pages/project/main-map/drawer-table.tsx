import type { ETrangThaiType } from "@/data/enums";
import type { IBlockPlanningArea, IPackage } from "@/data/interfaces";
import { usePackageListByBlockId } from "@/hooks";
import { getZoneColor } from "@/lib/progress-color";
import { Visibility } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, LinearProgress, Paper, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { useState } from "react";

interface IDrawerTableProps {
  selectedBlock?: IBlockPlanningArea;
  setSelectedPackage: (packageItem: IPackage) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export function DrawerTable({ selectedBlock, setSelectedPackage, setIsDialogOpen }: IDrawerTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sử dụng hook lấy package list
  const { data: packageList, isLoading } = usePackageListByBlockId(selectedBlock?.block_id || "");

  const handleViewPackage = (packageItem: IPackage) => {
    setSelectedPackage(packageItem);
    setIsDialogOpen(true);
  };

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên gói thầu</TableCell>
                <TableCell>Nhà thầu</TableCell>
                <TableCell>Ngày bắt đầu kế hoạch</TableCell>
                <TableCell>Ngày kết thúc kế hoạch</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Tiến trình kế hoạch</TableCell>
                <TableCell>Tiến trình thực tế</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packageList?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.ten_goi_thau || "N/a"}</TableCell>
                  <TableCell>{item.nha_thau || "N/a"}</TableCell>
                  <TableCell>{item.ngay_bd_ke_hoach || "N/a"}</TableCell>
                  <TableCell>{item.ngay_kt_ke_hoach || "N/a"}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_thuc_te)
                      }}
                    >
                      {item.trang_thai || "N/a"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.tien_do_ke_hoach}
                        sx={{
                          height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)', '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_ke_hoach)} 0%, ${getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_ke_hoach)}aa 100%)`,
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'white',
                          textShadow: '0 0 2px rgba(255,255,255,0.8)'
                        }}
                      >
                        {item.tien_do_ke_hoach}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.tien_do_thuc_te}
                        sx={{
                          height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)', '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_thuc_te)} 0%, ${getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_thuc_te)}aa 100%)`,
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'white',
                          textShadow: '0 0 2px rgba(255,255,255,0.8)'
                        }}
                      >
                        {item.tien_do_thuc_te}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleViewPackage(item)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={packageList?.length || 0}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số dòng / trang:"
            rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
          />
        </>
      )}
    </Paper>
  )
}