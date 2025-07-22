import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { IBlockPlanningArea, IPlanningArea, IZonePlanningArea } from "@/data/interfaces";
import { usePackageListByBlockId } from '@/hooks';
import { getZoneColor } from "@/lib/progress-color";
import { Box, Button, Divider, Drawer, LinearProgress, Popover, Typography } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType, type LeafletMouseEvent } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Polygon, Polyline, TileLayer } from "react-leaflet";

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