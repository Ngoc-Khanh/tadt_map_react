import { LayerPanel, LayerToggleButton } from "@/components/pages/project/layer-button";
import type { IBlockPlanningArea, IPlanningArea, IZonePlanningArea } from "@/data/interfaces";
import { Box } from "@mui/material";
import { LatLngBounds, Map as LeafletMapType } from "leaflet";
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

  const handleToggleZoneVisibility = useCallback((zoneId: string) => {
    setVisibleZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(zoneId)) {
        newSet.delete(zoneId);
        const zone = planningAreaList?.zones.find(z => z.zone_id === zoneId);
        if (zone) {
          zone.blocks.forEach(block => {
            newSet.delete(block.block_id);
          });
          setVisibleBlocks(prevBlocks => {
            const newBlockSet = new Set(prevBlocks);
            zone.blocks.forEach(block => newBlockSet.delete(block.block_id));
            return newBlockSet;
          });
        }
      } else {
        newSet.add(zoneId);
      }
      return newSet;
    });
  }, [planningAreaList]);

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
            color: '#2563eb',
            fillColor: '#3b82f6',
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
            color: '#dc2626',
            weight: 3,
            opacity: 0.8
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
        {planningAreaList?.zones.map(zone =>
          zone.blocks.map(block => renderBlockPolyline(block))
        )}
      </MapContainer>
    </Box>
  )
}