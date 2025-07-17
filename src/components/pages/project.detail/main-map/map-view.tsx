import { Map as LeafletMapType } from 'leaflet';
import { useRef } from "react";
import { MapContainer, Polygon, TileLayer } from 'react-leaflet';
import type { IZoneWithGeometry, IBlockWithGeometry } from "@/data/interfaces";

interface MapViewProps {
  zoneList?: IZoneWithGeometry[];
  blockList?: IBlockWithGeometry[];
  visibleZones: Set<string>;
  visibleBlocks: Set<string>;
  onMapReady?: (map: LeafletMapType) => void;
}

export function MapView({ zoneList, blockList, visibleZones, visibleBlocks, onMapReady }: MapViewProps) {
  const mapRef = useRef<LeafletMapType | null>(null);

  return (
    <MapContainer
      ref={(map) => {
        mapRef.current = map;
        if (map && onMapReady) {
          onMapReady(map);
        }
      }}
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

      {/* Hiển thị các zones */}
      {zoneList?.map((zone) => {
        // Chỉ hiển thị zone nếu nó có trong visibleZones
        if (!visibleZones.has(zone.zone_id)) return null;

        const coordinates = zone.geometry?.[0]?.coordinates;
        if (!coordinates || coordinates.length === 0) return null;

        const positions = coordinates.map((coord: [number, number, number]) => [coord[1], coord[0]] as [number, number]);

        return (
          <Polygon
            key={`zone-${zone.zone_id}`}
            positions={positions}
            pathOptions={{
              color: "#0EA5E9",
              weight: 2,
              fillColor: "#0EA5E9",
              fillOpacity: 0.3
            }}
          />
        );
      })}

      {/* Hiển thị các blocks */}
      {zoneList?.map((zone) => {
        // Chỉ xử lý zone được hiển thị
        if (!visibleZones.has(zone.zone_id)) return null;

        // Lấy danh sách block thuộc zone này
        const blocksInZone = blockList?.filter(block => block.zone_id === zone.zone_id) || [];

        return blocksInZone.map((block) => {
          // Chỉ hiển thị block nếu nó có trong visibleBlocks
          if (!visibleBlocks.has(block.block_id)) return null;

          const blockCoordinates = block.geometry?.[0]?.coordinates;
          if (!blockCoordinates || blockCoordinates.length === 0) return null;

          const blockPositions = blockCoordinates.map((coord: [number, number, number]) => [coord[1], coord[0]] as [number, number]);

          return (
            <Polygon
              key={`block-${block.block_id}`}
              positions={blockPositions}
              pathOptions={{
                color: "#F59E0B",
                weight: 2,
                fillColor: "#F59E0B",
                fillOpacity: 0.3
              }}
            />
          );
        });
      })}
    </MapContainer>
  );
}
