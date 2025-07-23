import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { ETrangThaiType } from "@/data/enums";
import type { IBlockPlanningArea, IPlanningArea, IZonePlanningArea } from "@/data/interfaces";
import { usePackageListByBlockId } from '@/hooks';
import { getZoneColor } from "@/lib/progress-color";
import { TrendingUp } from "@mui/icons-material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, Divider, Drawer, LinearProgress, Paper, Popover, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType, type LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface IProjectMainMapProps {
  planningAreaList?: IPlanningArea;
  isLoading: boolean;
}

export function ProjectMainMap({ planningAreaList }: IProjectMainMapProps) {
  const mapRef = useRef<LeafletMapType | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Khởi tạo với tất cả zones và blocks visible
  const [visibleZones, setVisibleZones] = useState<Set<string>>(() => {
    if (!planningAreaList?.zones) return new Set();
    return new Set(planningAreaList.zones.map(zone => zone.zone_id));
  });

  const [visibleBlocks, setVisibleBlocks] = useState<Set<string>>(() => {
    if (!planningAreaList?.zones) return new Set();
    const blockIds: string[] = [];
    planningAreaList.zones.forEach(zone => {
      zone.blocks.forEach(block => blockIds.push(block.block_id));
    });
    return new Set(blockIds);
  });

  // State cho Drawer block detail
  const [selectedBlock, setSelectedBlock] = useState<IBlockPlanningArea | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<null | { mouseX: number; mouseY: number }>(null);
  const [popupBlock, setPopupBlock] = useState<IBlockPlanningArea | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState('');

  const statistics = [
    { label: 'Đang triển khai, đúng tiến độ', count: 15, color: 'info.light', icon: <TaskAltIcon color="info" /> },
    { label: 'Đang triển khai, chậm tiến độ', count: 20, color: 'warning.light', icon: <WarningIcon color="warning" /> },
    { label: 'Hoàn thành, đúng tiến độ', count: 14, color: 'success.light', icon: <CheckCircleIcon color="success" /> },
    { label: 'Hoàn thành, chậm tiến độ', count: 20, color: 'error.light', icon: <ErrorIcon color="error" /> },
    { label: 'Chưa triển khai', count: 18, color: 'grey.300', icon: <PauseCircleOutlineIcon color="disabled" /> }
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

  const open = Boolean(anchorEl);

  // Cập nhật visibility khi dữ liệu planningAreaList thay đổi
  useEffect(() => {
    if (planningAreaList?.zones) {
      const zoneIds = new Set(planningAreaList.zones.map(zone => zone.zone_id));
      setVisibleZones(zoneIds);
      const blockIds: string[] = [];
      planningAreaList.zones.forEach(zone => {
        zone.blocks.forEach(block => blockIds.push(block.block_id));
      });
      setVisibleBlocks(new Set(blockIds));
    }
  }, [planningAreaList]);

  // Chuyển đổi coordinates từ GeoJSON sang Leaflet format
  const convertGeometryToLatLng = useCallback((coordinates: number[][]): [number, number][] => {
    return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
  }, []);

  // Sửa lại: chỉ tắt zone, không tắt block khi tắt zone
  const handleToggleZoneVisibility = useCallback((zoneId: string) => {
    setVisibleZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
  }, []);

  // Toggle visibility của block
  const handleToggleBlockVisibility = useCallback((blockId: string) => {
    setVisibleBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) newSet.delete(blockId);
      else newSet.add(blockId);
      return newSet;
    });
  }, []);

  // Zoom đến geometry
  const handleZoomToGeometry = useCallback((coordinates: number[][]) => {
    if (!mapRef.current || !coordinates || coordinates.length === 0) return;
    try {
      const latLngs = convertGeometryToLatLng(coordinates);
      const bounds = new LatLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16
      });
    } catch (error) {
      console.error('[ProjectMainMap] Error zooming to geometry:', error);
    }
  }, [convertGeometryToLatLng]);

  // Khi click vào block, mở popup
  const handleBlockClick = (block: IBlockPlanningArea, e: LeafletMouseEvent) => {
    setPopupBlock(block);
    setPopupAnchor({ mouseX: e.originalEvent.clientX, mouseY: e.originalEvent.clientY });
  };

  // Sử dụng hook lấy package list
  const { data: packageList } = usePackageListByBlockId(selectedBlock?.block_id || "");

  // Render Zone Polygon
  const renderZonePolygon = useCallback((zone: IZonePlanningArea) => {
    if (!visibleZones.has(zone.zone_id) || !zone.geom?.coordinates) return null;

    try {
      const positions = convertGeometryToLatLng(zone.geom.coordinates);
      return (
        <Polyline
          key={`zone-${zone.zone_id}`}
          positions={positions}
          pathOptions={{
            color: getZoneColor(zone.trang_thai, zone.tien_do_thuc_te),
            weight: 3.5,
            opacity: 1,
            dashArray: "8 8"
          }}
        />
      );
    } catch (error) {
      console.error(`[ProjectMainMap] Error rendering zone ${zone.zone_id}:`, error);
      return null;
    }
  }, [visibleZones, convertGeometryToLatLng]);

  // Render Block Polyline
  const renderBlockPolyline = useCallback((block: IBlockPlanningArea) => {
    if (!visibleBlocks.has(block.block_id) || !block.geom?.coordinates) return null;

    try {
      const positions = convertGeometryToLatLng(block.geom.coordinates);
      return (
        <Polyline
          key={`block-${block.block_id}`}
          positions={positions}
          pathOptions={{
            color: getZoneColor(block.trang_thai, block.tien_do_thuc_te),
            weight: 3,
            opacity: 0.8
          }}
          eventHandlers={{
            click: (e) => handleBlockClick(block, e)
          }}
        />
      );
    } catch (error) {
      console.error(`[ProjectMainMap] Error rendering block ${block.block_id}:`, error);
      return null;
    }
  }, [visibleBlocks, convertGeometryToLatLng]);

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Box className="absolute top-2 left-2 z-[1000]">
        <LayerToggleButton
          planningAreaList={planningAreaList}
          open={open}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
        />
      </Box>

      <LayerPanel
        open={open}
        anchorEl={anchorEl}
        planningAreaList={planningAreaList}
        visibleZones={visibleZones}
        visibleBlocks={visibleBlocks}
        handleToggleZoneVisibility={handleToggleZoneVisibility}
        handleZoomToGeometry={handleZoomToGeometry}
        handleToggleBlockVisibility={handleToggleBlockVisibility}
      />

      <MapContainer
        ref={mapRef}
        center={[21.0285, 105.8542]}
        zoom={10}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        preferCanvas={true}
        attributionControl={true}
        worldCopyJump={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Render Zone Polygons */}
        {planningAreaList?.zones.map(zone => renderZonePolygon(zone))}

        {/* Render Block Polylines */}
        {planningAreaList?.zones.map(zone => zone.blocks.map(block => renderBlockPolyline(block)))}
      </MapContainer>
      {/* Popover khi click vào block */}
      <Popover
        open={!!popupAnchor}
        anchorReference="anchorPosition"
        anchorPosition={
          popupAnchor
            ? { top: popupAnchor.mouseY, left: popupAnchor.mouseX }
            : undefined
        }
        onClose={() => setPopupAnchor(null)}
        PaperProps={{ sx: { p: 2, minWidth: 220 } }}
      >
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Tên Block: {popupBlock?.ten_block}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mã block: {popupBlock?.block_id}
        </Typography>
        {typeof popupBlock?.tien_do_thuc_te === 'number' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Tiến độ:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={popupBlock.tien_do_thuc_te}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te),
                }
              }}
            />
            <Typography variant="caption" sx={{ color: getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te) }}>
              {popupBlock.tien_do_thuc_te}%
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setSelectedBlock(popupBlock);
            setPopupAnchor(null);
          }}
          fullWidth
        >
          Xem chi tiết
        </Button>
      </Popover>
      {/* Drawer hiển thị chi tiết block */}
      <Drawer
        anchor="bottom"
        open={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        PaperProps={{
          sx: {
            height: '85vh',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 3,
            overflow: 'auto',
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Tên Block: {popupBlock?.block_name}
        </Typography>
        {popupBlock?.block_id ? (
          <Typography variant="body2" color="text.secondary">
            Mã block: {popupBlock?.block_id}
          </Typography>
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
        {typeof popupBlock?.tien_do_thuc_te === 'number' && (
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

        {/* Bảng */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên gói thầu</TableCell>
                <TableCell>Nhà thầu</TableCell>
                <TableCell>Ngày ký HĐ</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Tiến trình kế hoạch</TableCell>
                <TableCell>Tiến trình thực tế</TableCell>
                <TableCell>Vướng mắc</TableCell>
                <TableCell>Chỉ đạo</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packageList?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.ten_goi_thau || ""}</TableCell>
                  <TableCell>{item.nha_thau || ""}</TableCell>
                  <TableCell>{""}</TableCell> {/* Ngày ký HĐ */}
                  <TableCell>{""}</TableCell> {/* Ngày kết thúc */}
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getZoneColor(item.trang_thai as ETrangThaiType, item.tien_do_thuc_te)
                      }}
                    >
                      {item.trang_thai || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={0} // giả định 100% kế hoạch
                        sx={{
                          height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)', '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${getZoneColor(item.trang_thai as ETrangThaiType, 0)} 0%, ${getZoneColor(item.trang_thai as ETrangThaiType, 0)}aa 100%)`,
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
                        0%
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
                  <TableCell>{""}</TableCell> {/* Vướng mắc */}
                  <TableCell>{""}</TableCell> {/* Chỉ đạo */}
                  <TableCell>
                    <Button variant="text" size="small">Xem</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={packageList?.length || 0}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // reset về trang đầu
          }}
          labelRowsPerPage="Số dòng / trang:"
          rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
        />
      </Drawer>
    </Box>
  )
}