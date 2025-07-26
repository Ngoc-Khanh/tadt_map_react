import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { IBlockPlanningArea, IPlanningArea } from "@/data/interfaces";
import { Box } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { MainMapContainer, MainMapDrawer, MainMapPopover } from "./main-map";
import { ProjectLoading } from "./project-loading";

interface IProjectMainMapProps {
  planningAreaList?: IPlanningArea;
  isLoading: boolean;
}

export function ProjectMainMap({ planningAreaList, isLoading }: IProjectMainMapProps) {
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
      zone.blocks.forEach(block => {
        // Tạo ID fallback cho blocks không có ID
        const blockKey = (block.block_id && block.block_id.trim() !== '') 
          ? block.block_id 
          : `fallback-${JSON.stringify(block.geom?.coordinates?.[0] || [])}`;
        blockIds.push(blockKey);
      });
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
        zone.blocks.forEach(block => {
          // Tạo ID fallback cho blocks không có ID
          const blockKey = (block.block_id && block.block_id.trim() !== '') 
            ? block.block_id 
            : `fallback-${JSON.stringify(block.geom?.coordinates?.[0] || [])}`;
          blockIds.push(blockKey);
        });
      });
      setVisibleBlocks(new Set(blockIds));
    }
  }, [planningAreaList]);

  // Chuyển đổi coordinates từ GeoJSON sang Leaflet format
  const convertGeometryToLatLng = useCallback((coordinates: number[][]): [number, number][] => {
    return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
  }, []);

  // Fine-tune bounds sau khi map đã khởi tạo với center và zoom phù hợp
  useEffect(() => {
    if (!mapRef.current || !planningAreaList?.zones || planningAreaList.zones.length === 0) return;
    try {
      // Lấy tất cả coordinates từ zones và blocks
      const allCoordinates: [number, number][] = [];
      planningAreaList.zones.forEach(zone => {
        if (zone.geom?.coordinates && zone.geom.coordinates.length > 0) {
          const zoneCoords = convertGeometryToLatLng(zone.geom.coordinates);
          allCoordinates.push(...zoneCoords);
        }
        zone.blocks.forEach(block => {
          if (block.geom?.coordinates && block.geom.coordinates.length > 0) {
            const blockCoords = convertGeometryToLatLng(block.geom.coordinates);
            allCoordinates.push(...blockCoords);
          }
        });
      });

      if (allCoordinates.length > 0) {
        const bounds = new LatLngBounds(allCoordinates);
        // Delay để map khởi tạo xong với center/zoom mới, sau đó fine-tune bounds
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, {
              padding: [30, 30],
              maxZoom: 16,
              animate: true,
              duration: 1.0
            });
          }
        }, 500); // Tăng delay để map khởi tạo xong
      }
    } catch (error) {
      console.error('[ProjectMainMap] Error fine-tuning bounds:', error);
    }
  }, [planningAreaList, convertGeometryToLatLng]);

  if (isLoading) return <ProjectLoading />

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
        mapRef={mapRef as React.RefObject<LeafletMapType>}
        open={open}
        anchorEl={anchorEl}
        planningAreaList={planningAreaList}
        visibleZones={visibleZones}
        visibleBlocks={visibleBlocks}
        setVisibleZones={setVisibleZones}
        setVisibleBlocks={setVisibleBlocks}
        convertGeometryToLatLng={convertGeometryToLatLng}
      />

      <MainMapContainer
        mapRef={mapRef as React.RefObject<LeafletMapType>}
        planningAreaList={planningAreaList}
        visibleZones={visibleZones}
        visibleBlocks={visibleBlocks}
        setPopupBlock={setPopupBlock}
        setPopupAnchor={setPopupAnchor}
        convertGeometryToLatLng={convertGeometryToLatLng}
      />

      {/* Popover khi click vào block */}
      <MainMapPopover
        popupAnchor={popupAnchor}
        setPopupAnchor={setPopupAnchor}
        popupBlock={popupBlock}
        setSelectedBlock={setSelectedBlock}
      />

      {/* Drawer hiển thị chi tiết block */}
      <MainMapDrawer
        popupBlock={popupBlock}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
      />
    </Box>
  )
}