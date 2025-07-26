import type { IZonePlanningArea } from "@/data/interfaces";
import { getZoneColor } from "@/lib/progress-color";
import { memo } from "react";
import { Polyline } from "react-leaflet";

interface IZonePolygonProps {
  zone: IZonePlanningArea;
  visibleZones: Set<string>;
  convertGeometryToLatLng: (coordinates: number[][]) => [number, number][];
}

// React component được tối ưu với memo để tránh re-render không cần thiết
export const ZonePolygon = memo<IZonePolygonProps>(({ 
  zone, 
  visibleZones, 
  convertGeometryToLatLng 
}) => {
  if (!visibleZones.has(zone.zone_id) || !zone.geom?.coordinates) return null;

  try {
    const positions = convertGeometryToLatLng(zone.geom.coordinates);
    return (
      <Polyline
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
});

ZonePolygon.displayName = 'ZonePolygon';