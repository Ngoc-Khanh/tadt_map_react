import type { ETrangThaiType } from "@/data/enums";
import type { IBlockPlanningArea } from "@/data/interfaces";
import { usePackageListByBlockId } from "@/hooks";
import { getZoneColor } from "@/lib/progress-color";
import { CheckCircle, Close, Error, PauseCircleOutline, TaskAlt, TrendingUp, Warning } from "@mui/icons-material";
import { Box, Button, Drawer, IconButton, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface IMainMapDrawerProps {
  popupBlock: IBlockPlanningArea | null;
  selectedBlock: IBlockPlanningArea | null;
  setSelectedBlock: (block: IBlockPlanningArea | null) => void;
}

export function MainMapDrawer({ popupBlock, selectedBlock, setSelectedBlock }: IMainMapDrawerProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState('');

  const statistics = [
    { label: 'Đang triển khai, đúng tiến độ', count: 15, color: 'info.light', icon: <TaskAlt color="info" /> },
    { label: 'Đang triển khai, chậm tiến độ', count: 20, color: 'warning.light', icon: <Warning color="warning" /> },
    { label: 'Hoàn thành, đúng tiến độ', count: 14, color: 'success.light', icon: <CheckCircle color="success" /> },
    { label: 'Hoàn thành, chậm tiến độ', count: 20, color: 'error.light', icon: <Error color="error" /> },
    { label: 'Chưa triển khai', count: 18, color: 'grey.300', icon: <PauseCircleOutline color="disabled" /> }
  ];

  // Chuẩn bị data cho PieChart
  const pieChartData = statistics.map(item => ({
    name: item.label,
    value: item.count,
    color: item.color === 'info.light' ? '#29b6f6' :
      item.color === 'warning.light' ? '#ffa726' :
        item.color === 'success.light' ? '#66bb6a' :
          item.color === 'error.light' ? '#ef5350' : '#bdbdbd'
  }));

  const COLORS = ['#29b6f6', '#ffa726', '#66bb6a', '#ef5350', '#bdbdbd'];

  // Sử dụng hook lấy package list
  const { data: packageList } = usePackageListByBlockId(selectedBlock?.block_id || "");

  return (
    <Drawer
      anchor="bottom"
      open={!!selectedBlock}
      onClose={() => setSelectedBlock(null)}
      PaperProps={{
        sx: {
          height: '85vh',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header với nút đóng */}
        <Box sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          flexShrink: 0
        }}>
          <IconButton
            onClick={() => setSelectedBlock(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Tên Block: {popupBlock?.block_name}
          </Typography>
          {popupBlock?.block_id ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Mã block: {popupBlock?.block_id}
              </Typography>
              
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Tiến độ thực hiện
                  </Typography>
                </Stack>

                <Box sx={{ position: 'relative', width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={popupBlock.tien_do_thuc_te}
                    sx={{
                      height: 16,
                      borderRadius: 6,
                      backgroundColor: 'rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: `linear-gradient(90deg, ${getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te)} 0%, ${getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te)}aa 100%)`,
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        fontSize: 13,
                      }}
                    >
                      {popupBlock.tien_do_thuc_te}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{
              p: 1.5,
              bgcolor: 'warning.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'warning.200',
              mt: 1,
              textAlign: 'center'
            }}>
              <Typography variant="body2" color="warning.dark" fontWeight={500}>
                Chưa gắn mã block
              </Typography>
            </Box>
          )}
        </Box>

        {/* Content area với scroll */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          pt: 2
        }}>
          {typeof popupBlock?.tien_do_thuc_te === 'number' && (
            <Box>


              {/* Phần biểu đồ + thống kê */}
              <Box sx={{ mt: 2, width: '100%' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3
                }}>
                  <Box sx={{ flex: '0 0 300px' }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        height: '100%'
                      }}
                    >
                      <Typography
                        fontWeight={600}
                        gutterBottom
                      >
                        Tiến độ phân khu {popupBlock?.ten_block}
                      </Typography>
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                            >
                              {pieChartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                              labelStyle={{ color: '#000' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: 1, height: '100%' }}>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      height: '150px'
                    }}>
                      {statistics.map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            flexBasis: '20%',
                            flex: 1,
                            bgcolor: item.color,
                            p: 2,
                            textAlign: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}
                        >
                          {item.icon}
                          <Typography fontSize={13} fontWeight={500} mt={0.5}>
                            {item.label}
                          </Typography>
                          <Typography fontSize={20} fontWeight={700}>
                            {item.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Phần tìm kiếm */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Danh sách gói thầu (Phân khu M2-11)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Tìm kiếm gói thầu..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button variant="contained">Tìm kiếm</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          <Paper elevation={1}>
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
                      <Button variant="text" size="small">Xem</Button>
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
          </Paper>
        </Box>
      </Box>
    </Drawer>
  )
}