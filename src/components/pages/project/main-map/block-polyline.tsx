import type { IBlockPlanningArea } from "@/data/interfaces";
import { getZoneColor } from "@/lib/progress-color";
import type { LeafletMouseEvent } from "leaflet";
import { memo } from "react";
import { Polyline } from "react-leaflet";

interface IBlockPolylineProps {
  block: IBlockPlanningArea;
  visibleBlocks: Set<string>;
  convertGeometryToLatLng: (coordinates: number[][]) => [number, number][];
  handleBlockClick: (block: IBlockPlanningArea, e: LeafletMouseEvent) => void;
}

// React component được tối ưu với memo để tránh re-render không cần thiết
export const BlockPolyline = memo<IBlockPolylineProps>(({ 
  block, 
  visibleBlocks, 
  convertGeometryToLatLng, 
  handleBlockClick 
}) => {
  if (!block.geom?.coordinates) return null;
  
  // Tạo ID fallback cho blocks không có ID
  const blockKey = block.block_id && block.block_id.trim() !== '' ? block.block_id : `fallback-${JSON.stringify(block.geom?.coordinates?.[0] || [])}`;
  
  if (!visibleBlocks.has(blockKey)) return null;

  try {
    const positions = convertGeometryToLatLng(block.geom.coordinates);
    return (
      <Polyline
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
});

BlockPolyline.displayName = 'BlockPolyline';