import type { IBlockPlanningArea, IPlanningArea } from "@/data/interfaces";
import type { LeafletMouseEvent, Map } from "leaflet";
import React, { useCallback, useMemo, memo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { BlockPolyline, ZonePolygon } from ".";

interface IMainMapContainerProps {
  mapRef?: React.RefObject<Map>;
  planningAreaList?: IPlanningArea;
  visibleZones: Set<string>;
  visibleBlocks: Set<string>;
  setPopupBlock: (block: IBlockPlanningArea) => void;
  setPopupAnchor: (anchor: { mouseX: number; mouseY: number }) => void;
  convertGeometryToLatLng: (coordinates: number[][]) => [number, number][];
}

export const MainMapContainer = memo<IMainMapContainerProps>(function MainMapContainer({ mapRef, planningAreaList, visibleZones, visibleBlocks, setPopupBlock, setPopupAnchor, convertGeometryToLatLng }) {
  // Tính toán center từ dữ liệu planningAreaList với useMemo để tối ưu performance
  const mapCenter = useMemo((): [number, number] => {
    if (!planningAreaList?.zones || planningAreaList.zones.length === 0) return [21.0285, 105.8542]; // Default Hà Nội

    try {
      const allCoordinates: [number, number][] = [];
      // Lấy coordinates từ zones
      planningAreaList.zones.forEach(zone => {
        if (zone.geom?.coordinates && zone.geom.coordinates.length > 0) {
          const zoneCoords = convertGeometryToLatLng(zone.geom.coordinates);
          allCoordinates.push(...zoneCoords);
        }
      });
      // Nếu zones không có coordinates, lấy từ blocks
      if (allCoordinates.length === 0) {
        planningAreaList.zones.forEach(zone => {
          zone.blocks.forEach(block => {
            if (block.geom?.coordinates && block.geom.coordinates.length > 0) {
              const blockCoords = convertGeometryToLatLng(block.geom.coordinates);
              allCoordinates.push(...blockCoords);
            }
          });
        });
      }
      if (allCoordinates.length > 0) {
        // Tính trung bình của tất cả coordinates
        const sumLat = allCoordinates.reduce((sum, coord) => sum + coord[0], 0);
        const sumLng = allCoordinates.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLat / allCoordinates.length, sumLng / allCoordinates.length];
      }
    } catch (error) {
      console.error('[ProjectMainMap] Error calculating center:', error);
    }
    return [21.0285, 105.8542]; // Fallback to Hà Nội
  }, [planningAreaList, convertGeometryToLatLng]);

  // Tính toán zoom level phù hợp với useMemo để tối ưu performance
  const initialZoom = useMemo((): number => {
    if (!planningAreaList?.zones || planningAreaList.zones.length === 0) return 10; // Default zoom
    try {
      const allCoordinates: [number, number][] = [];
      planningAreaList.zones.forEach(zone => {
        if (zone.geom?.coordinates && zone.geom.coordinates.length > 0) {
          const zoneCoords = convertGeometryToLatLng(zone.geom.coordinates);
          allCoordinates.push(...zoneCoords);
        }
      });
      if (allCoordinates.length === 0) {
        planningAreaList.zones.forEach(zone => {
          zone.blocks.forEach(block => {
            if (block.geom?.coordinates && block.geom.coordinates.length > 0) {
              const blockCoords = convertGeometryToLatLng(block.geom.coordinates);
              allCoordinates.push(...blockCoords);
            }
          });
        });
      }
      if (allCoordinates.length > 0) {
        // Tính khoảng cách để xác định zoom level phù hợp
        const lats = allCoordinates.map(coord => coord[0]);
        const lngs = allCoordinates.map(coord => coord[1]);
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);
        // Tính zoom dựa trên range
        if (maxRange > 1) return 12;
        if (maxRange > 0.1) return 14;
        if (maxRange > 0.01) return 16;
        return 18;
      }
    } catch (error) {
      console.error('[ProjectMainMap] Error calculating zoom:', error);
    }
    return 10; // Default zoom
  }, [planningAreaList, convertGeometryToLatLng]);

  // Khi click vào block, mở popup
  const handleBlockClick = useCallback((block: IBlockPlanningArea, e: LeafletMouseEvent) => {
    setPopupBlock(block);
    setPopupAnchor({ mouseX: e.originalEvent.clientX, mouseY: e.originalEvent.clientY });
  }, [setPopupBlock, setPopupAnchor]);

  return (
    <MapContainer
      ref={mapRef}
      center={mapCenter}
      zoom={initialZoom}
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
      {planningAreaList?.zones.map(zone => (
        <ZonePolygon
          key={zone.zone_id}
          zone={zone}
          visibleZones={visibleZones}
          convertGeometryToLatLng={convertGeometryToLatLng}
        />
      ))}

      {/* Render Block Polylines */}
      {planningAreaList?.zones.map((zone) =>
        zone.blocks.map((block) => {
          // Tạo key fallback cho blocks không có ID - phải giống với logic trong BlockPolyline
          const uniqueKey = (block.block_id && block.block_id.trim() !== '') 
            ? block.block_id 
            : `fallback-${JSON.stringify(block.geom?.coordinates?.[0] || [])}`;
          return (
            <BlockPolyline
              key={uniqueKey}
              block={block}
              visibleBlocks={visibleBlocks}
              convertGeometryToLatLng={convertGeometryToLatLng}
              handleBlockClick={handleBlockClick}
            />
          );
        })
      )}
    </MapContainer>
  )
});