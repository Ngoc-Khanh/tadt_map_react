import { useBlockWithGeometryInProject, useZoneWithGeometryInProject } from "@/hooks/useMockData";
import { useNamedRegions } from "@/hooks/useNamedRegions";
import { getLatLngsFromGeom } from "@/lib/lat-lags-gem";
import { Box } from "@mui/material";
import { Map as LeafletMapType } from 'leaflet';
import { useCallback, useEffect, useRef, useState } from "react";
import { LayerPanel, LayerToggleButton, MapView } from "./main-map";

export function ProjectMainMap({ projectId }: { projectId: string }) {
  const { data: zoneList } = useZoneWithGeometryInProject(projectId!);
  const { data: blockList } = useBlockWithGeometryInProject(projectId!);
  const { namedRegions } = useNamedRegions();
  const mapRef = useRef<LeafletMapType | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleZones, setVisibleZones] = useState<Set<string>>(new Set());
  const [visibleBlocks, setVisibleBlocks] = useState<Set<string>>(new Set());
  const [visibleNamedRegions, setVisibleNamedRegions] = useState<Set<string>>(new Set());

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (zoneList && zoneList.length > 0) {
      const allZoneIds = zoneList.map(zone => zone.zone_id);
      setVisibleZones(new Set(allZoneIds));
    }
  }, [zoneList]);

  useEffect(() => {
    if (blockList && blockList.length > 0) {
      const allBlockIds = blockList.map(block => block.block_id);
      setVisibleBlocks(new Set(allBlockIds));
    }
  }, [blockList]);

  // Auto-show tất cả named regions từ localStorage
  useEffect(() => {
    if (namedRegions && namedRegions.length > 0) {
      const allRegionIds = namedRegions.map(region => region.block_id);
      setVisibleNamedRegions(new Set(allRegionIds));
    }
  }, [namedRegions]);

  const handleTogglePanel = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setTimeout(() => setIsAnimating(false), 200);
  }, [anchorEl, isAnimating]);

  const toggleZoneVisibility = useCallback((zoneId: string) => {
    setVisibleZones((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) newSet.delete(zoneId);
      else newSet.add(zoneId);
      return newSet;
    });
  }, []);

  const toggleBlockVisibility = useCallback((blockId: string) => {
    setVisibleBlocks((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) newSet.delete(blockId);
      else newSet.add(blockId);
      return newSet;
    });
  }, []);

  const toggleNamedRegionVisibility = useCallback((regionId: string) => {
    setVisibleNamedRegions((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) newSet.delete(regionId);
      else newSet.add(regionId);
      return newSet;
    });
  }, []);

  // Navigation function
  const navigateToGeometry = useCallback((geometry: { type: string; coordinates: unknown }[], isPackage = false) => {
    if (!mapRef?.current || !geometry?.length) return;
    const allCoords = geometry.flatMap(getLatLngsFromGeom);
    if (!allCoords.length) return;
    if (allCoords.length === 1) {
      // Zoom to hơn cho package (level 18 thay vì 16)
      const zoomLevel = isPackage ? 18 : 16;
      mapRef?.current.setView(allCoords[0], zoomLevel, { animate: true });
    } else {
      const lats = allCoords.map(([lat]) => lat);
      const lngs = allCoords.map(([, lng]) => lng);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
      // Zoom to hơn cho package và padding nhỏ hơn để zoom sát hơn
      const maxZoom = isPackage ? 18 : 15;
      const padding: [number, number] = isPackage ? [20, 20] : [40, 40];
      mapRef.current.fitBounds(bounds, { animate: true, padding, maxZoom });
    }
  }, []);

  const handleMapReady = useCallback((map: LeafletMapType) => {
    mapRef.current = map;
  }, []);

  // Tính tổng số geometry
  const totalGeometries = blockList?.reduce((sum: number, block) => {
    const geomCount = (block.geometry?.length || 0);
    return sum + geomCount;
  }, 0) || 0;

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Box className="absolute top-2 left-2 z-[1000]">
        <LayerToggleButton
          isOpen={open}
          isAnimating={isAnimating}
          totalGeometries={totalGeometries}
          onClick={handleTogglePanel}
        />
      </Box>

      <LayerPanel
        open={open}
        anchorEl={anchorEl}
        zoneList={zoneList}
        blockList={blockList}
        visibleZones={visibleZones}
        visibleBlocks={visibleBlocks}
        onToggleZoneVisibility={toggleZoneVisibility}
        onToggleBlockVisibility={toggleBlockVisibility}
        onNavigateToGeometry={navigateToGeometry}
        displayedNamedRegions={namedRegions}
        visibleNamedRegions={visibleNamedRegions}
        onToggleNamedRegionVisibility={toggleNamedRegionVisibility}
      />

      <MapView
        zoneList={zoneList}
        blockList={blockList}
        visibleZones={visibleZones}
        visibleBlocks={visibleBlocks}
        onMapReady={handleMapReady}
        displayedNamedRegions={namedRegions}
        visibleNamedRegions={visibleNamedRegions}
      />
    </Box>
  );
}