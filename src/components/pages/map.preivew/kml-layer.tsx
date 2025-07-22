import { useSavePlanningArea, useSavePlanningAreaZone, usePlanningAreaList, useDeleteBlockInPlanningArea, useDeleteZoneInPlanningArea } from '@/hooks/usePlanningArea';
import { useZoneListByProjectId } from '@/hooks/useZones';
import { useBlockListByZoneId } from '@/hooks/useBlocks';
import type { ParsedKMLData } from '@/lib/kml-parser';
import { GeometryConverter } from '@/lib/geom-converter';
import type { Feature } from 'geojson';
import { LatLngBounds, Layer } from 'leaflet';
import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';

interface KMLLayerProps {
  projectId: string;
  data: ParsedKMLData;
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  fitBounds?: boolean;
  onFeatureClick?: (feature: Feature, layer: Layer) => void;
}

interface LayerWithStyle extends Layer {
  setStyle: (style: object) => void;
  _originalStyle?: object;
}

// Interface for assigned area info
interface AssignedAreaInfo {
  type: 'zone' | 'block';
  id: string;
  name: string;
}

export function KMLLayer({
  projectId,
  data,
  color = '#e74c3c',
  weight = 2,
  fillColor = '#e74c3c',
  fillOpacity = 0.3,
  fitBounds = false,
  onFeatureClick,
}: KMLLayerProps) {
  const map = useMap();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  // Form states
  const [zoneForm, setZoneForm] = useState<{ zone_id: string }>({ zone_id: '' });
  const [areaForm, setAreaForm] = useState<{ zone_id: string; block_id: string; block_name: string }>({
    zone_id: '',
    block_id: '',
    block_name: ''
  });

  // API hooks
  const savePlanningAreaZone = useSavePlanningAreaZone();
  const savePlanningArea = useSavePlanningArea();
  const deleteZoneInPlanningArea = useDeleteZoneInPlanningArea();
  const deleteBlockInPlanningArea = useDeleteBlockInPlanningArea();

  // Data hooks
  const { data: zoneList } = useZoneListByProjectId(projectId);
  const { data: blockList } = useBlockListByZoneId(areaForm.zone_id);
  const { data: planningAreaList } = usePlanningAreaList(projectId);

  /**
   * Check if a feature's geometry overlaps with already assigned areas
   * Returns the assigned area info if found
   */
  const getAssignedAreaInfo = (feature: Feature): AssignedAreaInfo | null => {
    if (!planningAreaList || !feature.geometry) return null;

    try {
      const featureGeomWKT = GeometryConverter.toLineStringWKT(feature.geometry);

      // Check against assigned zones
      for (const zone of planningAreaList.zones || []) {
        if (zone.geom && zone.geom.coordinates) {
          try {
            const zoneGeomWKT = GeometryConverter.toLineStringWKT(zone.geom as unknown as Feature['geometry']);

            // Simple coordinate comparison (you might want more sophisticated geometry comparison)
            if (geometriesOverlap(featureGeomWKT, zoneGeomWKT)) {
              return {
                type: 'zone',
                id: zone.zone_id,
                name: zone.ten_phan_khu || 'Phân khu'
              };
            }
          } catch (error) {
            console.warn('Error comparing zone geometry:', error);
          }
        }

        // Check against assigned blocks
        for (const block of zone.blocks || []) {
          if (block.geom && block.geom.coordinates) {
            try {
              const blockGeomWKT = GeometryConverter.toLineStringWKT(block.geom as unknown as Feature['geometry']);

              if (geometriesOverlap(featureGeomWKT, blockGeomWKT)) {
                return {
                  type: 'block',
                  id: block.block_id,
                  name: block.ten_block || 'Hạng mục'
                };
              }
            } catch (error) {
              console.warn('Error comparing block geometry:', error);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error checking feature assignment:', error);
    }

    return null;
  };

  /**
   * Check if a feature's geometry overlaps with already assigned areas (legacy function)
   */
  const isFeatureAlreadyAssigned = (feature: Feature): boolean => {
    return getAssignedAreaInfo(feature) !== null;
  };

  /**
   * Simple geometry overlap check by comparing coordinate strings
   * In production, you might want to use a proper spatial library like Turf.js
   */
  const geometriesOverlap = (geom1: string, geom2: string): boolean => {
    // Extract coordinates from WKT strings for simple comparison
    const coords1 = geom1.replace(/^LINESTRING\(|\)$/g, '');
    const coords2 = geom2.replace(/^LINESTRING\(|\)$/g, '');

    // Simple string comparison - in production you'd want proper spatial intersection
    return coords1 === coords2;
  };

  useEffect(() => {
    if (fitBounds && data.features.length > 0) {
      // Calculate bounds from all features
      const bounds = new LatLngBounds([]);

      data.features.forEach(feature => {
        const { geometry } = feature;
        if (!geometry.coordinates) return;

        const addCoordsToBounds = (coords: number[] | number[][] | number[][][]): void => {
          if (typeof coords[0] === 'number') {
            // Single coordinate pair [lng, lat]
            const [lng, lat] = coords as number[];
            bounds.extend([lat, lng]);
          } else if (Array.isArray(coords[0])) {
            // Array of coordinates
            (coords as number[][] | number[][][]).forEach((coord) => addCoordsToBounds(coord));
          }
        };

        addCoordsToBounds(geometry.coordinates);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [data, fitBounds, map]);

  const handleEachFeature = (feature: Feature, layer: Layer) => {
    // Check if feature is already assigned
    const assignedAreaInfo = getAssignedAreaInfo(feature);

    // Create popup content with feature properties and conditional buttons
    if (feature.properties) {
      const properties = Object.entries(feature.properties)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>');

      if (assignedAreaInfo) {
        // Show "already assigned" message with delete button
        const assignedName = assignedAreaInfo.name;
        const assignedType = assignedAreaInfo.type;
        const assignedId = assignedAreaInfo.id;

        const deleteButtonId = `delete-btn-${feature.id || Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;

        const buttonsHtml = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button 
              id="${deleteButtonId}" 
              style="
                background: #e74c3c; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer; 
                font-size: 12px;
                font-weight: bold;
                width: 100%;
              "
              onmouseover="this.style.background='#c0392b'"
              onmouseout="this.style.background='#e74c3c'"
            >
              🗑️ Xóa vị trí
            </button>
          </div>
        `;

        const popupContent = `
          <div style="font-family: Arial, sans-serif;">
            ${properties ? `<div style="margin-bottom: 12px;">${properties}</div>` : ''}
            <div style="
              background: #f8d7da; 
              color: #721c24; 
              padding: 12px; 
              border-radius: 4px; 
              border: 1px solid #f5c6cb;
              text-align: center;
              font-weight: bold;
            ">
              ⚠️ Vị trí này đã được gắn với ${assignedType}: ${assignedName}
              <div style="font-size: 12px; margin-top: 4px; font-weight: normal;">
                Bạn có thể xóa vị trí này để gắn lại với phân khu/hạng mục khác.
              </div>
            </div>
            ${buttonsHtml}
          </div>
        `;

        layer.bindPopup(popupContent, {
          maxWidth: 280,
          closeButton: true
        });

        // Add event listeners for buttons after popup opens
        layer.on('popupopen', () => {
          const deleteButton = document.getElementById(deleteButtonId);

          if (deleteButton) {
            deleteButton.onclick = async (e) => {
              e.stopPropagation();
              const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa ${assignedType === 'zone' ? 'phân khu' : 'hạng mục'} "${assignedName}" không?`);
              if (confirmDelete) {
                try {
                  let success = false;
                  if (assignedType === 'zone') {
                    success = await deleteZoneInPlanningArea.mutateAsync(assignedId);
                  } else {
                    success = await deleteBlockInPlanningArea.mutateAsync(assignedId);
                  }

                  if (success) {
                    alert(`Xóa ${assignedType === 'zone' ? 'phân khu' : 'hạng mục'} thành công!`);
                  } else {
                    alert(`Không thể xóa ${assignedType === 'zone' ? 'phân khu' : 'hạng mục'}. Vui lòng thử lại!`);
                  }
                } catch (error) {
                  console.error('[KMLLayer] Failed to delete:', error);
                  alert(`Có lỗi xảy ra khi xóa ${assignedType === 'zone' ? 'phân khu' : 'hạng mục'}!`);
                }
              }
              layer.closePopup();
            };
          }
        });
      } else {
        // Check if description contains "RANHGIOI"
        const description = feature.properties.description || feature.properties.Description || '';
        const isRanhGioi = description.includes('RANHGIOI');

        // Generate consistent button IDs
        const zoneButtonId = `zone-btn-${feature.id || Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;
        const areaButtonId = `area-btn-${feature.id || Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;

        let buttonsHtml = '';

        if (isRanhGioi) {
          // Show only zone button for RANHGIOI
          buttonsHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button 
                id="${zoneButtonId}" 
                style="
                  background: #27ae60; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 12px;
                  font-weight: bold;
                  width: 100%;
                "
                onmouseover="this.style.background='#229954'"
                onmouseout="this.style.background='#27ae60'"
              >
                🏘️ Gắn phân khu
              </button>
            </div>
          `;
        } else {
          // Show only area button for non-RANHGIOI
          buttonsHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button 
                id="${areaButtonId}" 
                style="
                  background: #3498db; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 12px;
                  font-weight: bold;
                  width: 100%;
                "
                onmouseover="this.style.background='#2980b9'"
                onmouseout="this.style.background='#3498db'"
              >
                📋 Gắn hạng mục
              </button>
            </div>
          `;
        }

        const popupContent = `
          <div style="font-family: Arial, sans-serif;">
            ${properties ? `<div style="margin-bottom: 12px;">${properties}</div>` : ''}
            ${buttonsHtml}
          </div>
        `;

        layer.bindPopup(popupContent, {
          maxWidth: 280,
          closeButton: true
        });

        // Add event listeners for buttons after popup opens
        layer.on('popupopen', () => {
          const zoneButton = document.getElementById(zoneButtonId);
          const areaButton = document.getElementById(areaButtonId);

          if (zoneButton && isRanhGioi) {
            zoneButton.onclick = (e) => {
              e.stopPropagation();
              setSelectedFeature(feature);
              setShowZoneModal(true);
              layer.closePopup();
            };
          }

          if (areaButton && !isRanhGioi) {
            areaButton.onclick = (e) => {
              e.stopPropagation();
              setSelectedFeature(feature);
              setShowAreaModal(true);
              layer.closePopup();
            };
          }
        });
      }
    }

    // Store original style for layer
    const originalStyle = {
      color,
      weight,
      fillColor,
      fillOpacity,
      opacity: 0.8,
      dashArray: null
    };

    // Add click handler to highlight selected feature
    layer.on('click', () => {
      // Reset previous selected layer style
      if (selectedLayer && selectedLayer !== layer && 'setStyle' in selectedLayer) {
        const prevLayer = selectedLayer as LayerWithStyle;
        prevLayer.setStyle(prevLayer._originalStyle || originalStyle);
      }

      // Store original style in layer
      const currentLayer = layer as LayerWithStyle;
      currentLayer._originalStyle = originalStyle;

      // Highlight current selected layer
      if ('setStyle' in layer) {
        currentLayer.setStyle({
          color: '#c0392b', // Màu đỏ đậm
          weight: 3,
          fillColor: '#c0392b',
          fillOpacity: 0.4,
          opacity: 1,
          dashArray: '10, 5' // Nét đứt: 10px vạch, 5px khoảng cách
        });
      }

      setSelectedLayer(layer);
      setSelectedFeature(feature);

      if (onFeatureClick) {
        onFeatureClick(feature, layer);
      }
    });
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !zoneForm.zone_id || !projectId) return;

    try {
      // Convert geometry to LINESTRING WKB format
      const lineStringWKT = GeometryConverter.toLineStringWKT(selectedFeature.geometry);
      const wkbGeometry = GeometryConverter.toWKB(lineStringWKT);

      await savePlanningAreaZone.mutateAsync({
        project_id: projectId,
        zone_id: zoneForm.zone_id,
        zone_geom: wkbGeometry,
      });
      setShowZoneModal(false);
      setZoneForm({ zone_id: '' });
      alert('Gắn phân khu thành công!');
    } catch (error) {
      console.error('[KMLLayer] Failed to save planning area zone:', error);
      alert('Có lỗi xảy ra khi gắn phân khu!');
    }
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !areaForm.zone_id || !areaForm.block_id || !areaForm.block_name || !projectId) return;

    try {
      // Convert geometry to LINESTRING WKB format
      const lineStringWKT = GeometryConverter.toLineStringWKT(selectedFeature.geometry);
      const wkbGeometry = GeometryConverter.toWKB(lineStringWKT);

      await savePlanningArea.mutateAsync({
        project_id: projectId,
        zone_id: areaForm.zone_id,
        block_id: areaForm.block_id,
        block_name: areaForm.block_name,
        block_geom: wkbGeometry,
      });
      setShowAreaModal(false);
      setAreaForm({ zone_id: '', block_id: '', block_name: '' });
      alert('Gắn hạng mục thành công!');
    } catch (error) {
      console.error('[KMLLayer] Failed to save planning area:', error);
      alert('Có lỗi xảy ra khi gắn hạng mục!');
    }
  };

  // Handle block selection change and auto-fill block name
  const handleBlockChange = (blockId: string) => {
    const selectedBlock = blockList?.find(block => block.block_id === blockId);
    setAreaForm(prev => ({
      ...prev,
      block_id: blockId,
      block_name: selectedBlock?.ten_block || ''
    }));
  };

  return (
    <>
      <GeoJSON
        data={data}
        style={(feature) => {
          if (feature && isFeatureAlreadyAssigned(feature)) {
            // Style for already assigned features
            return {
              color: '#95a5a6', // Gray color for assigned features
              weight: 2,
              fillColor: '#95a5a6',
              fillOpacity: 0.2,
              opacity: 0.6,
              dashArray: '5, 5' // Dashed line for assigned features
            };
          }
          // Default style for unassigned features
          return {
            color,
            weight,
            fillColor,
            fillOpacity,
            opacity: 0.8
          };
        }}
        onEachFeature={handleEachFeature}
      />

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">🏘️ Gắn phân khu</h3>
              <button
                onClick={() => setShowZoneModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleZoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID (Tự động)
                </label>
                <input
                  type="text"
                  value={projectId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn phân khu
                </label>
                <select
                  required
                  value={zoneForm.zone_id}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, zone_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Chọn phân khu --</option>
                  {zoneList?.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.ten_phan_khu}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savePlanningAreaZone.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {savePlanningAreaZone.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Area Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📋 Gắn hạng mục</h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAreaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID (Tự động)
                </label>
                <input
                  type="text"
                  value={projectId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn phân khu
                </label>
                <select
                  required
                  value={areaForm.zone_id}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, zone_id: e.target.value, block_id: '', block_name: '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn phân khu --</option>
                  {zoneList?.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.ten_phan_khu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn block
                </label>
                <select
                  required
                  value={areaForm.block_id}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  disabled={!areaForm.zone_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Chọn block --</option>
                  {blockList?.map((block) => (
                    <option key={block.block_id} value={block.block_id}>
                      {block.ten_block}
                    </option>
                  ))}
                </select>
                {!areaForm.zone_id && (
                  <p className="text-sm text-gray-500 mt-1">Vui lòng chọn phân khu trước</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Block (Tự động)
                </label>
                <input
                  type="text"
                  value={areaForm.block_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savePlanningArea.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savePlanningArea.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}