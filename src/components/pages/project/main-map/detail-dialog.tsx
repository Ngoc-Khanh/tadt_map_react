import type { ETrangThaiType } from "@/data/enums";
import type { IPackage } from "@/data/interfaces";
import { usePackageDetail } from "@/hooks";
import { formatDate } from "@/lib/format-date";
import { getZoneColor } from "@/lib/progress-color";
import { Assessment, Assignment, Business, CalendarToday, CheckCircle, Close, Image, ReportProblem, TaskAlt, Timeline, Warning } from "@mui/icons-material";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, LinearProgress, Paper, Typography } from "@mui/material";

interface IDetailDialogProps {
  isDialogOpen: boolean;
  handleCloseDialog: () => void;
  selectedPackage: IPackage | null;
}
export function DetailDialog({ isDialogOpen, handleCloseDialog, selectedPackage }: IDetailDialogProps) {
  const { data: packageDetail, isLoading: isLoadingDetail } = usePackageDetail(selectedPackage?.package_id || "");

  return (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
      <DialogTitle sx={{
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pr: 6
      }}>
        <Assessment />
        {selectedPackage?.ten_goi_thau || 'Chi tiết gói thầu'}
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 4, maxHeight: '75vh', overflow: 'auto' }}>
        {isLoadingDetail ? (
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Đang tải chi tiết...</Typography>
          </Box>
        ) : (
          <Box>
            {/* Thông tin cơ bản */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Business sx={{ fontSize: 28 }} />
                Thông tin cơ bản
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '300px 1fr 250px' }, gap: 3, mb: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Mã gói thầu
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {packageDetail?.package_id || selectedPackage?.package_id || 'N/a'}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Tên gói thầu
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {packageDetail?.ten_goi_thau || selectedPackage?.ten_goi_thau || 'N/a'}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: 'grey.50', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Trạng thái
                  </Typography>
                  <Chip
                    label={packageDetail?.trang_thai || selectedPackage?.trang_thai || 'N/a'}
                    sx={{
                      bgcolor: getZoneColor(
                        (packageDetail?.trang_thai || selectedPackage?.trang_thai) as ETrangThaiType,
                        packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0
                      ),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      height: 36,
                      alignSelf: 'center'
                    }}
                  />
                </Paper>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Nhà thầu
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {packageDetail?.nha_thau || selectedPackage?.nha_thau || 'N/a'}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Chi phí dự án
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {packageDetail?.chi_phi ? `${packageDetail.chi_phi.toLocaleString('vi-VN')} VNĐ` : 'N/a'}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Thời gian thực hiện */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <CalendarToday sx={{ fontSize: 28 }} />
                Lịch trình thực hiện
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
                  <Typography variant="body2" fontWeight={600} color="info.dark" gutterBottom>
                    Ngày bắt đầu kế hoạch
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatDate(packageDetail?.ngay_bd_ke_hoach || selectedPackage?.ngay_bd_ke_hoach || 'N/a')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: 'warning.50', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <Typography variant="body2" fontWeight={600} color="warning.dark" gutterBottom>
                    Ngày kết thúc kế hoạch
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatDate(packageDetail?.ngay_kt_ke_hoach || selectedPackage?.ngay_kt_ke_hoach || 'N/a')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: 'grey.50', borderLeft: '4px solid', borderColor: 'grey.400' }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                    Ngày cập nhật cuối
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatDate(packageDetail?.ngay_cap_nhat || 'N/a')}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Paper sx={{ p: 3, bgcolor: packageDetail?.ngay_bd_thuc_te ? 'success.50' : 'grey.100', borderLeft: '4px solid', borderColor: packageDetail?.ngay_bd_thuc_te ? 'success.main' : 'grey.400' }}>
                  <Typography variant="body2" fontWeight={600} color={packageDetail?.ngay_bd_thuc_te ? 'success.dark' : 'text.secondary'} gutterBottom>
                    Ngày bắt đầu thực tế
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color={packageDetail?.ngay_bd_thuc_te ? 'success.main' : 'text.secondary'}>
                    {formatDate(packageDetail?.ngay_bd_thuc_te || 'Chưa bắt đầu')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, bgcolor: packageDetail?.ngay_kt_thuc_te ? 'success.50' : 'grey.100', borderLeft: '4px solid', borderColor: packageDetail?.ngay_kt_thuc_te ? 'success.main' : 'grey.400' }}>
                  <Typography variant="body2" fontWeight={600} color={packageDetail?.ngay_kt_thuc_te ? 'success.dark' : 'text.secondary'} gutterBottom>
                    Ngày kết thúc thực tế
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color={packageDetail?.ngay_kt_thuc_te ? 'success.main' : 'text.secondary'}>
                    {formatDate(packageDetail?.ngay_kt_thuc_te || 'Chưa hoàn thành')}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Báo cáo tiến độ */}
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Timeline sx={{ fontSize: 28 }} />
                Báo cáo tiến độ
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
                {/* Tiến độ kế hoạch */}
                <Paper sx={{ p: 4, bgcolor: 'primary.50', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="primary.dark">
                      Tiến độ kế hoạch
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {packageDetail?.tien_do_ke_hoach || selectedPackage?.tien_do_ke_hoach || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={packageDetail?.tien_do_ke_hoach || selectedPackage?.tien_do_ke_hoach || 0}
                    sx={{
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 10,
                        background: `linear-gradient(90deg, #2196f3 0%, #1976d2 100%)`,
                      }
                    }}
                  />
                </Paper>

                {/* Tiến độ thực tế */}
                <Paper sx={{ p: 4, bgcolor: 'success.50', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="success.dark">
                      Tiến độ thực tế
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color={getZoneColor(
                      (packageDetail?.trang_thai || selectedPackage?.trang_thai) as ETrangThaiType,
                      packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0
                    )}>
                      {packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0}
                    sx={{
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: 'rgba(0,0,0,0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 10,
                        background: `linear-gradient(90deg, ${getZoneColor(
                          (packageDetail?.trang_thai || selectedPackage?.trang_thai) as ETrangThaiType,
                          packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0
                        )} 0%, ${getZoneColor(
                          (packageDetail?.trang_thai || selectedPackage?.trang_thai) as ETrangThaiType,
                          packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0
                        )}aa 100%)`,
                      }
                    }}
                  />
                </Paper>
              </Box>

              {/* Phân tích chênh lệch */}
              <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom>
                  Phân tích chênh lệch tiến độ:
                </Typography>
                {(() => {
                  const planned = packageDetail?.tien_do_ke_hoach || selectedPackage?.tien_do_ke_hoach || 0;
                  const actual = packageDetail?.tien_do_thuc_te || selectedPackage?.tien_do_thuc_te || 0;
                  const difference = actual - planned;

                  if (difference > 0) {
                    return (
                      <Typography variant="body1" color="success.main" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 20 }} />
                        Vượt tiến độ kế hoạch {difference.toFixed(1)}%
                      </Typography>
                    );
                  } else if (difference < 0) {
                    return (
                      <Typography variant="body1" color="error.main" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning sx={{ fontSize: 20 }} />
                        Chậm tiến độ kế hoạch {Math.abs(difference).toFixed(1)}%
                      </Typography>
                    );
                  } else {
                    return (
                      <Typography variant="body1" color="primary.main" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TaskAlt sx={{ fontSize: 20 }} />
                        Đúng tiến độ kế hoạch
                      </Typography>
                    );
                  }
                })()}
              </Paper>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Ghi chú và Vướng mắc */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment />
                Ghi chú & Vướng mắc
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {packageDetail?.vuong_mac && (
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <ReportProblem color="warning" sx={{ fontSize: 20, mt: 0.2 }} />
                      <Typography variant="body2" fontWeight={600} color="warning.dark">
                        Vướng mắc
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {packageDetail.vuong_mac}
                    </Typography>
                  </Paper>
                )}

                {packageDetail?.chi_dao && (
                  <Paper sx={{ p: 2, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Assignment color="info" sx={{ fontSize: 20, mt: 0.2 }} />
                      <Typography variant="body2" fontWeight={600} color="info.dark">
                        Chỉ đạo
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {packageDetail.chi_dao}
                    </Typography>
                  </Paper>
                )}

                {!packageDetail?.vuong_mac && !packageDetail?.chi_dao && (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Không có ghi chú hoặc vướng mắc nào được ghi nhận
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Hình ảnh */}
            {(packageDetail?.anh_tong_quan || packageDetail?.anh_thuc_te) && (
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Image sx={{ fontSize: 28 }} />
                  Hình ảnh thực tế
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                  {packageDetail?.anh_tong_quan && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                        📸 Ảnh tổng quan
                      </Typography>
                      <Box
                        component="img"
                        src={packageDetail.anh_tong_quan}
                        alt="Ảnh tổng quan"
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'primary.light',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => window.open(packageDetail.anh_tong_quan, '_blank')}
                      />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                        Click để xem ảnh kích thước đầy đủ
                      </Typography>
                    </Paper>
                  )}

                  {packageDetail?.anh_thuc_te && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                        🏗️ Ảnh hiện trạng
                      </Typography>
                      <Box
                        component="img"
                        src={packageDetail.anh_thuc_te}
                        alt="Ảnh thực tế"
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'success.light',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => window.open(packageDetail.anh_thuc_te, '_blank')}
                      />
                      {packageDetail?.anh_thuc_te_lat && packageDetail?.anh_thuc_te_lng && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            📍 Tọa độ: {packageDetail.anh_thuc_te_lat}, {packageDetail.anh_thuc_te_lng}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                        Click để xem ảnh kích thước đầy đủ
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={handleCloseDialog} variant="outlined" color="primary">
          Đóng
        </Button>
        <Button variant="contained" color="primary">
          Xem báo cáo chi tiết
        </Button>
      </DialogActions>
    </Dialog>
  )
}