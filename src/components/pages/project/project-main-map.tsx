import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { ETrangThaiType } from "@/data/enums";
import type { IBlockPlanningArea, IPlanningArea, IZonePlanningArea } from "@/data/interfaces";
import { usePackageListByBlockId } from '@/hooks';
import { getStatusIcon, getZoneColor } from "@/lib/progress-color";
import { Avatar, Box, Button, Card, CardContent, Chip, Divider, Drawer, IconButton, LinearProgress, List, ListItem, ListItemText, Paper, Popover, Stack, Typography } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType, type LeafletMouseEvent } from "leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuBlocks, LuPackage, LuX } from "react-icons/lu";
import { TbProgress } from "react-icons/tb";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";

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

  const renderedZones = useMemo(
    () => planningAreaList?.zones.map(zone => renderZonePolygon(zone)),
    [planningAreaList?.zones, renderZonePolygon]
  );
  const renderedBlocks = useMemo(
    () =>
      planningAreaList?.zones.flatMap(zone =>
        zone.blocks.map(block => renderBlockPolyline(block))
      ),
    [planningAreaList?.zones, renderBlockPolyline]
  );

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
        {renderedZones}

        {/* Render Block Polylines */}
        {renderedBlocks}
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
              Cần gắn thêm mã block
            </Typography>
          </Box>
        )}
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
        {popupBlock?.block_id && (
          <>
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
          </>
        )}
      </Popover>
      {/* Drawer hiển thị chi tiết block */}
      <Drawer
        anchor="right"
        open={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        PaperProps={{
          sx: {
            width: 450,
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              position: 'relative'
            }}
          >
            <IconButton
              onClick={() => setSelectedBlock(null)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <LuX size={24} color="#667eea" />
            </IconButton>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <LuBlocks size={24} color="#667eea" />
              </Avatar>
              <Typography variant="h5" fontWeight={700}>
                Chi tiết Block
              </Typography>
            </Stack>
          </Paper>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {selectedBlock && (
              <>
                {/* Block Info Card */}
                <Card
                  elevation={3}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#2c3e50' }}>
                      Tên Block: {selectedBlock.ten_block}
                    </Typography>

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                          Mã block:
                        </Typography>
                        <Chip
                          label={selectedBlock.block_id}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                          Trạng thái:
                        </Typography>
                        <Chip
                          icon={getStatusIcon(selectedBlock.trang_thai)}
                          label={selectedBlock.trang_thai}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', color: getZoneColor(selectedBlock.trang_thai, selectedBlock.tien_do_thuc_te) }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {typeof selectedBlock.tien_do_thuc_te === 'number' && (
                  <Box sx={{ mt: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <TbProgress size={18} color="#667eea" />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Tiến độ thực hiện
                      </Typography>
                    </Stack>

                    <Box sx={{ position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedBlock.tien_do_thuc_te}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${getZoneColor(selectedBlock.trang_thai, selectedBlock.tien_do_thuc_te)} 0%, ${getZoneColor(selectedBlock.trang_thai, selectedBlock.tien_do_thuc_te)}aa 100%)`,
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {selectedBlock.tien_do_thuc_te}%
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, pb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LuPackage size={24} color="#667eea" />
                        <Typography variant="h6" fontWeight={700} color="#2c3e50">
                          Danh sách gói thầu
                        </Typography>
                        <Chip
                          label={`${packageList?.length || 0} gói thầu`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    {isLoadingPackages ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Đang tải...
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {packageList?.length === 0 ? (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Không có gói thầu nào.
                            </Typography>
                          </Box>
                        ) : (
                          <List sx={{ pt: 0 }}>
                            {packageList?.map((pkg, index) => (
                              <React.Fragment key={pkg.package_id}>
                                <ListItem
                                  sx={{
                                    py: 2,
                                    px: 3,
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                    }
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {pkg.ten_goi_thau}
                                      </Typography>
                                    }
                                    secondary={
                                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                        <Chip
                                          icon={getStatusIcon(pkg.trang_thai as ETrangThaiType)}
                                          label={pkg.trang_thai}
                                          size="small"
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={pkg.tien_do_thuc_te}
                                            sx={{
                                              width: 60,
                                              height: 6,
                                              borderRadius: 3,
                                              backgroundColor: 'rgba(0,0,0,0.08)',
                                              '& .MuiLinearProgress-bar': {
                                                borderRadius: 3,
                                                backgroundColor: getZoneColor(pkg.trang_thai as ETrangThaiType, pkg.tien_do_thuc_te),
                                              }
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            sx={{ color: getZoneColor(pkg.trang_thai as ETrangThaiType, pkg.tien_do_thuc_te) }}
                                          >
                                            {pkg.tien_do_thuc_te}%
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    }
                                  />
                                </ListItem>
                                {index < packageList.length - 1 && <Divider sx={{ mx: 3 }} />}
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}