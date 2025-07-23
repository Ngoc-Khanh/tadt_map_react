import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { IBlockPlanningArea, IPackage, IPlanningArea, IZonePlanningArea } from "@/data/interfaces";
import { usePackageListByBlockId } from '@/hooks';
import { getZoneColor } from "@/lib/progress-color";
import { PackageAPI } from "@/services/api/package.api";
import { Close } from "@mui/icons-material";

import { Box, Button, Divider, Drawer, Grid, IconButton, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType, type LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Polygon, Polyline, TileLayer } from "react-leaflet";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
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
  const [packages, setPackages] = useState<IPackage[]>([]);
  const [searchText, setSearchText] = useState('');

  const statistics = [
    { label: 'Đang triển khai, đúng tiến độ', count: 15, color: 'info.light', icon: <TaskAltIcon color="info" /> },
    { label: 'Đang triển khai, chậm tiến độ', count: 20, color: 'warning.light', icon: <WarningIcon color="warning" /> },
    { label: 'Hoàn thành, đúng tiến độ', count: 14, color: 'success.light', icon: <CheckCircleIcon color="success" /> },
    { label: 'Hoàn thành, chậm tiến độ', count: 20, color: 'error.light', icon: <ErrorIcon color="error" /> },
    { label: 'Chưa triển khai', count: 18, color: 'grey.300', icon: <PauseCircleOutlineIcon color="disabled" /> }
  ];

  const dataTable = [
    {
      stt: 1,
      name: "Khảo sát địa hình – địa chất công trình",
      contractor: "Công ty khảo sát ABC",
      start: "05/06/2023",
      end: "28/06/2023",
      status: "Hoàn thành, đúng tiến độ",
      plan: 100,
      actual: 100,
      issue: "Không",
      directive: "Không"
    }
  ].filter(row => row.name.toLowerCase().includes(searchText.toLowerCase()));


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
  const handleBlockClick = async (block: IBlockPlanningArea, e: LeafletMouseEvent) => {
    console.log("Thông tin block: ", block);

    try {
      const resp = await PackageAPI.getPackageListByBlockId(block.block_id);
      console.log("Danh sách gói thầu:", resp);
      // Có thể set vào state nếu cần
      setPackages(resp);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói thầu:", error);
    }

    setPopupBlock(block);
    setPopupAnchor({ mouseX: e.originalEvent.clientX, mouseY: e.originalEvent.clientY });
  };


  // Sử dụng hook lấy package list
  const { data: packageList, isLoading: isLoadingPackages } = usePackageListByBlockId(selectedBlock?.block_id || "");

  // Render Zone Polygon
  const renderZonePolygon = useCallback((zone: IZonePlanningArea) => {
    if (!visibleZones.has(zone.zone_id) || !zone.geom?.coordinates) return null;

    try {
      const positions = convertGeometryToLatLng(zone.geom.coordinates);
      return (
        <Polygon
          key={`zone-${zone.zone_id}`}
          positions={positions}
          pathOptions={{
            color: getZoneColor(zone.trang_thai, zone.tien_do_thuc_te),
            fillColor: getZoneColor(zone.trang_thai, zone.tien_do_thuc_te),
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8
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

      {/* Menu layer */}
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

      {/*Map*/}
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

      {/* Hiển thị table */}
      <Drawer
        anchor="bottom"
        open={!!popupAnchor}
        onClose={() => setPopupAnchor(null)}
        PaperProps={{
          sx: {
            height: '75vh',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            p: 3,
            overflow: 'auto',
          },
        }}
      >
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() => setPopupAnchor(null)}
        >
          <Close />
        </IconButton>

        {/* Phần biểu đồ + thống kê */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography fontWeight={600} gutterBottom>Tiến độ phân khu M2-11</Typography>
              {/* <MyPieChartComponent data={pieChartData} /> */}
            </Paper>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {statistics.map((item, i) => (
              <Box
                key={i}
                sx={{
                  flexBasis: '20%',
                  flex: 1,
                  bgcolor: item.color,
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 1,
                  boxShadow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {item.icon}
                <Typography fontSize={13} fontWeight={500} mt={0.5}>{item.label}</Typography>
                <Typography fontSize={20} fontWeight={700}>{item.count}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>

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
              {packages.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell> {/* STT */}
                  <TableCell>{row.ten_goi_thau || ""}</TableCell>
                  <TableCell>{""}</TableCell> {/* Nhà thầu - không có trong IPackage */}
                  <TableCell>{""}</TableCell> {/* Ngày ký HĐ */}
                  <TableCell>{""}</TableCell> {/* Ngày kết thúc */}
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          row.trang_thai?.includes("đúng") ? "green" :
                            row.trang_thai?.includes("chậm") ? "orange" :
                              "gray"
                      }}
                    >
                      {row.trang_thai || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={100} // giả định 100% kế hoạch
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={row.tien_do_thuc_te ?? 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
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
          count={dataTable.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // reset về trang đầu
          }}
          labelRowsPerPage="Số dòng / trang:"
          rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
        />
      </Drawer>

      {/* Drawer hiển thị chi tiết block */}
      <Drawer
        anchor="right"
        open={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Chi tiết Block
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {selectedBlock && (
            <>
              <Typography variant="subtitle1" fontWeight={600}>
                Tên Block: {selectedBlock.ten_block}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mã block: {selectedBlock.block_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạng thái: {selectedBlock.trang_thai}
              </Typography>
              {typeof selectedBlock.tien_do_thuc_te === 'number' && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Tiến độ:
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedBlock.tien_do_thuc_te}
                    sx={{
                      height: 10,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getZoneColor(selectedBlock.trang_thai, selectedBlock.tien_do_thuc_te),
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: getZoneColor(selectedBlock.trang_thai, selectedBlock.tien_do_thuc_te) }}>
                    {selectedBlock.tien_do_thuc_te}%
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Danh sách gói thầu
              </Typography>
              {isLoadingPackages ? (
                <Typography variant="body2">Đang tải...</Typography>
              ) : (
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {packageList?.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Không có gói thầu nào.
                    </Typography>
                  )}
                  {packageList?.map(pkg => (
                    <li key={pkg.package_id} style={{ marginBottom: 8 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {pkg.ten_goi_thau}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Trạng thái: {pkg.trang_thai} | Tiến độ: {pkg.tien_do_thuc_te}%
                      </Typography>
                    </li>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  )
}