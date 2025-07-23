/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBlockListByZoneId } from '@/hooks/useBlocks';
import { useDeleteBlockInPlanningArea, useDeleteZoneInPlanningArea, usePlanningAreaList, useSavePlanningArea, useSavePlanningAreaZone } from '@/hooks/usePlanningArea';
import { useZoneListByProjectId } from '@/hooks/useZones';
import { GeometryConverter } from '@/lib/geom-converter';
import type { ParsedKMLData } from '@/lib/kml-parser';
import type { Feature } from 'geojson';
import { LatLngBounds, Layer } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GeoJSON, LayerGroup, useMap } from 'react-leaflet';

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
  _featureId?: string;
  _isSelected?: boolean;
}

interface AssignedAreaInfo {
  type: 'zone' | 'block';
  id: string;
  name: string;
  hasBlockId?: boolean;
}

interface EnhancedFeature {
  feature: any;
  featureId: string;
  assignedInfo: AssignedAreaInfo | null;
  layerType: 'selected' | 'block-with-id' | 'block-new' | 'zone' | 'unassigned';
}

export function KMLLayer({
  projectId,
  data,
  color = '#e74c3c',
  weight = 3,
  fillColor = '#e74c3c',
  fillOpacity = 0.3,
  fitBounds = false,
  onFeatureClick,
}: KMLLayerProps) {
  const map = useMap();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  
  // Performance refs
  const layersRef = useRef<Map<string, LayerWithStyle>>(new Map());
  const geometryCacheRef = useRef<Map<string, boolean>>(new Map());

  // Form states
  const [zoneForm, setZoneForm] = useState<{ zone_id: string }>({ zone_id: '' });
  const [areaForm, setAreaForm] = useState<{
    zone_id: string;
    block_id: string;
    block_name: string
  }>({
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

  // Optimized geometry comparison với caching
  const geometriesOverlap = useCallback((geom1: string, geom2: string): boolean => {
    const cacheKey = `${geom1.slice(0, 50)}|||${geom2.slice(0, 50)}`;
    if (geometryCacheRef.current.has(cacheKey)) {
      return geometryCacheRef.current.get(cacheKey)!;
    }
    
    const coords1 = geom1.replace(/^LINESTRING\(|\)$/g, '');
    const coords2 = geom2.replace(/^LINESTRING\(|\)$/g, '');
    const result = coords1 === coords2;
    
    geometryCacheRef.current.set(cacheKey, result);
    return result;
  }, []);

  // Memoized assigned area checker
  const getAssignedAreaInfo = useCallback((feature: any): AssignedAreaInfo | null => {
    if (!planningAreaList?.zones || !feature?.geometry) return null;

    try {
      const featureGeomWKT = GeometryConverter.toLineStringWKT(feature.geometry);

      // Check zones first
      for (const zone of planningAreaList.zones) {
        if (zone.geom?.coordinates && zone.zone_id) {
          try {
            const zoneGeomWKT = GeometryConverter.toLineStringWKT(zone.geom as any);
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

        // Check blocks
        for (const block of zone.blocks || []) {
          if (block.geom?.coordinates) {
            try {
              const blockGeomWKT = GeometryConverter.toLineStringWKT(block.geom as any);
              if (geometriesOverlap(featureGeomWKT, blockGeomWKT)) {
                const hasValidBlockId = Boolean(block.block_id && block.block_id.trim() !== '');
                return { 
                  type: 'block', 
                  id: block.block_id || 'new', 
                  name: block.block_name || block.ten_block || 'Hạng mục',
                  hasBlockId: hasValidBlockId
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
  }, [planningAreaList, geometriesOverlap]);

  // Enhanced features phân loại theo layer type
  const categorizedFeatures = useMemo(() => {
    if (!data.features) return {
      selected: [],
      blockWithId: [],
      blockNew: [],
      zone: [],
      unassigned: []
    };

    const categories = {
      selected: [] as EnhancedFeature[],
      blockWithId: [] as EnhancedFeature[],
      blockNew: [] as EnhancedFeature[],
      zone: [] as EnhancedFeature[],
      unassigned: [] as EnhancedFeature[]
    };

    data.features.forEach((feature, index) => {
      const featureId = `feature-${index}`;
      const assignedInfo = getAssignedAreaInfo(feature);
      
      const enhancedFeature: EnhancedFeature = {
        feature,
        featureId,
        assignedInfo,
        layerType: 'unassigned'
      };

      // Phân loại feature
      if (selectedFeatureId === featureId) {
        enhancedFeature.layerType = 'selected';
        categories.selected.push(enhancedFeature);
      } else if (assignedInfo) {
        if (assignedInfo.type === 'zone') {
          enhancedFeature.layerType = 'zone';
          categories.zone.push(enhancedFeature);
        } else if (assignedInfo.hasBlockId) {
          enhancedFeature.layerType = 'block-with-id';
          categories.blockWithId.push(enhancedFeature);
        } else {
          enhancedFeature.layerType = 'block-new';
          categories.blockNew.push(enhancedFeature);
        }
      } else {
        categories.unassigned.push(enhancedFeature);
      }
    });

    return categories;
  }, [data.features, selectedFeatureId, getAssignedAreaInfo]);

  // Immediate selection function - NO DEBOUNCE
  const selectFeature = useCallback((featureId: string, feature: any) => {
    setSelectedFeatureId(featureId);
    setSelectedFeature(feature);
  }, []);

  // Style configs cho từng layer type
  const layerStyles = useMemo(() => ({
    selected: {
      color: '#c0392b',
      weight: 6,
      fillColor: '#c0392b',
      fillOpacity: 0.7,
      opacity: 1,
      dashArray: '10, 5'
    },
    blockWithId: {
      color: '#27ae60',
      weight: 4,
      fillColor: '#27ae60',
      fillOpacity: 0.6,
      opacity: 0.9
    },
    blockNew: {
      color: '#f39c12',
      weight: 4,
      fillColor: '#f39c12',
      fillOpacity: 0.6,
      opacity: 0.9
    },
    zone: {
      color: '#9b59b6',
      weight: 4,
      fillColor: '#9b59b6',
      fillOpacity: 0.6,
      opacity: 0.9
    },
    unassigned: {
      color,
      weight,
      fillColor,
      fillOpacity,
      opacity: 0.7
    }
  }), [color, weight, fillColor, fillOpacity]);

  // Create popup content
  const createPopupContent = useCallback((feature: any, assignedInfo: AssignedAreaInfo | null) => {
    const properties = Object.entries(feature.properties || {})
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br>');

    if (assignedInfo) {
      const deleteButtonId = `delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const statusText = assignedInfo.type === 'block' 
        ? (assignedInfo.hasBlockId ? '🟢 Hạng mục (Có Block ID)' : '🟠 Hạng mục (Tạo mới)')
        : '🟣 Phân khu';
      
      return {
        content: `
          <div style="font-family: 'Inter', 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.4;">
            ${properties ? `<div style="margin-bottom: 10px; color: #64748b; font-size: 12px;">${properties}</div>` : ''}
            <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); color: #475569; padding: 12px; border-radius: 8px; border-left: 4px solid ${assignedInfo.type === 'zone' ? '#9b59b6' : assignedInfo.hasBlockId ? '#27ae60' : '#f39c12'}; margin-bottom: 10px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${statusText}</div>
              <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${assignedInfo.name}</div>
            </div>
            <button id="${deleteButtonId}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; width: 100%; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);" 
                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(239, 68, 68, 0.35)'" 
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(239, 68, 68, 0.25)'">
              🗑️ Xóa vị trí
            </button>
          </div>
        `,
        deleteButtonId,
        assignedInfo
      };
    }

    const description = feature.properties?.description || feature.properties?.Description || '';
    const isRanhGioi = description.includes('RANHGIOI');
    const actionButtonId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: `
        <div style="font-family: 'Inter', 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.4;">
          ${properties ? `<div style="margin-bottom: 10px; color: #64748b; font-size: 12px;">${properties}</div>` : ''}
          <button id="${actionButtonId}" style="background: linear-gradient(135deg, ${isRanhGioi ? '#22c55e' : '#3b82f6'} 0%, ${isRanhGioi ? '#16a34a' : '#2563eb'} 100%); color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; width: 100%; transition: all 0.2s ease; box-shadow: 0 2px 6px ${isRanhGioi ? 'rgba(34, 197, 94, 0.25)' : 'rgba(59, 130, 246, 0.25)'};"
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px ${isRanhGioi ? 'rgba(34, 197, 94, 0.35)' : 'rgba(59, 130, 246, 0.35)'}'" 
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px ${isRanhGioi ? 'rgba(34, 197, 94, 0.25)' : 'rgba(59, 130, 246, 0.25)'}'">
            ${isRanhGioi ? '🏘️ Gắn phân khu' : '📋 Gắn hạng mục'}
          </button>
        </div>
      `,
      actionButtonId,
      isRanhGioi
    };
  }, []);

  // Handle each feature với performance optimization
  const createFeatureHandler = useCallback(() => {
    return (feature: any, layer: Layer) => {
      const featureIndex = data.features.findIndex((f: any) => f === feature);
      const featureId = `feature-${featureIndex}`;
      const layerWithStyle = layer as LayerWithStyle;
      
      layerWithStyle._featureId = featureId;
      layersRef.current.set(featureId, layerWithStyle);
      
      const assignedInfo = getAssignedAreaInfo(feature);
      const popupData = createPopupContent(feature, assignedInfo);

      layer.bindPopup(popupData.content, { 
        maxWidth: 300, 
        closeButton: true,
        className: 'modern-popup'
      });

      // Popup events
      layer.on('popupopen', () => {
        selectFeature(featureId, feature);
        
        if (assignedInfo && popupData.deleteButtonId) {
          const deleteButton = document.getElementById(popupData.deleteButtonId);
          if (deleteButton) {
            deleteButton.onclick = async (e) => {
              e.stopPropagation();
              const confirmDelete = confirm(`Xác nhận xóa ${assignedInfo.type === 'zone' ? 'phân khu' : 'hạng mục'} "${assignedInfo.name}"?`);
              if (confirmDelete && assignedInfo.id) {
                try {
                  const success = assignedInfo.type === 'zone'
                    ? await deleteZoneInPlanningArea.mutateAsync(assignedInfo.id)
                    : await deleteBlockInPlanningArea.mutateAsync(assignedInfo.id);

                  if (success) {
                    alert(`Xóa ${assignedInfo.type === 'zone' ? 'phân khu' : 'hạng mục'} thành công!`);
                  } else {
                    alert(`Không thể xóa. Vui lòng thử lại!`);
                  }
                } catch (error) {
                  console.error('Delete failed:', error);
                  alert('Có lỗi xảy ra!');
                }
              }
              layer.closePopup();
            };
          }
        } else if (popupData.actionButtonId) {
          const actionButton = document.getElementById(popupData.actionButtonId);
          if (actionButton) {
            actionButton.onclick = (e) => {
              e.stopPropagation();
              setSelectedFeature(feature);
              if (popupData.isRanhGioi) {
                setShowZoneModal(true);
              } else {
                setShowAreaModal(true);
              }
              layer.closePopup();
            };
          }
        }
      });

      // Click events - IMMEDIATE SELECTION
      layer.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        // Immediate selection - no delay
        selectFeature(featureId, feature);

        if (onFeatureClick) {
          onFeatureClick(feature, layer);
        }
      });
    };
  }, [data.features, getAssignedAreaInfo, createPopupContent, selectFeature, deleteZoneInPlanningArea, deleteBlockInPlanningArea, onFeatureClick]);

  // Clear cache when planning area changes
  useEffect(() => {
    geometryCacheRef.current.clear();
  }, [planningAreaList]);

  // Fit bounds effect
  useEffect(() => {
    if (fitBounds && data.features.length > 0) {
      const bounds = new LatLngBounds([]);

      data.features.forEach(feature => {
        const { geometry } = feature;
        if (!geometry.coordinates) return;

        const addCoordsToBounds = (coords: any): void => {
          if (typeof coords[0] === 'number') {
            const [lng, lat] = coords;
            bounds.extend([lat, lng]);
          } else if (Array.isArray(coords[0])) {
            coords.forEach((coord: any) => addCoordsToBounds(coord));
          }
        };

        addCoordsToBounds(geometry.coordinates);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [data, fitBounds, map]);

  // Submit handlers
  const handleZoneSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !zoneForm.zone_id) return;

    try {
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
      console.error('Failed to save planning area zone:', error);
      alert('Có lỗi xảy ra khi gắn phân khu!');
    }
  }, [selectedFeature, zoneForm.zone_id, projectId, savePlanningAreaZone]);

  const handleAreaSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !areaForm.zone_id || !areaForm.block_name) return;

    try {
      const lineStringWKT = GeometryConverter.toLineStringWKT(selectedFeature.geometry);
      const wkbGeometry = GeometryConverter.toWKB(lineStringWKT);

      const payload: any = {
        project_id: projectId,
        zone_id: areaForm.zone_id,
        block_name: areaForm.block_name,
        block_geom: wkbGeometry,
      };

      if (activeTab === 'existing' && areaForm.block_id) {
        payload.block_id = areaForm.block_id;
      }

      await savePlanningArea.mutateAsync(payload);
      
      setShowAreaModal(false);
      setAreaForm({ zone_id: '', block_id: '', block_name: '' });
      setActiveTab('new');
      alert('Gắn hạng mục thành công!');
    } catch (error) {
      console.error('Failed to save planning area:', error);
      alert('Có lỗi xảy ra khi gắn hạng mục!');
    }
  }, [selectedFeature, areaForm, activeTab, projectId, savePlanningArea]);

  // Form handlers
  const handleBlockChange = useCallback((blockId: string) => {
    const selectedBlock = blockList?.find(block => block.block_id === blockId);
    setAreaForm(prev => ({
      ...prev,
      block_id: blockId,
      block_name: selectedBlock?.ten_block || ''
    }));
  }, [blockList]);

  // Create typed GeoJSON data objects
  const createGeoJSONData = useCallback((features: any[]) => ({
    type: 'FeatureCollection' as const,
    features: features
  }), []);

  return (
    <>
      <style>{`
        .modern-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(148, 163, 184, 0.1);
          backdrop-filter: blur(8px);
        }
        .modern-popup .leaflet-popup-content {
          margin: 12px 16px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .modern-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
      `}</style>
      
      <LayerGroup>
        {/* Layer 1: Unassigned features - Lowest priority */}
        {categorizedFeatures.unassigned.length > 0 && (
          <GeoJSON
            key={`unassigned-${categorizedFeatures.unassigned.length}`}
            data={createGeoJSONData(categorizedFeatures.unassigned.map(item => item.feature))}
            style={layerStyles.unassigned}
            onEachFeature={createFeatureHandler()}
          />
        )}

        {/* Layer 2: Zone features */}
        {categorizedFeatures.zone.length > 0 && (
          <GeoJSON
            key={`zone-${categorizedFeatures.zone.length}`}
            data={createGeoJSONData(categorizedFeatures.zone.map(item => item.feature))}
            style={layerStyles.zone}
            onEachFeature={createFeatureHandler()}
          />
        )}

        {/* Layer 3: Block new features */}
        {categorizedFeatures.blockNew.length > 0 && (
          <GeoJSON
            key={`block-new-${categorizedFeatures.blockNew.length}`}
            data={createGeoJSONData(categorizedFeatures.blockNew.map(item => item.feature))}
            style={layerStyles.blockNew}
            onEachFeature={createFeatureHandler()}
          />
        )}

        {/* Layer 4: Block with ID features */}
        {categorizedFeatures.blockWithId.length > 0 && (
          <GeoJSON
            key={`block-with-id-${categorizedFeatures.blockWithId.length}`}
            data={createGeoJSONData(categorizedFeatures.blockWithId.map(item => item.feature))}
            style={layerStyles.blockWithId}
            onEachFeature={createFeatureHandler()}
          />
        )}

        {/* Layer 5: Selected feature - Highest priority */}
        {categorizedFeatures.selected.length > 0 && (
          <GeoJSON
            key={`selected-${selectedFeatureId}-${categorizedFeatures.selected.length}`}
            data={createGeoJSONData(categorizedFeatures.selected.map(item => item.feature))}
            style={layerStyles.selected}
            onEachFeature={createFeatureHandler()}
          />
        )}
      </LayerGroup>

      {/* Enhanced Zone Modal */}
      {showZoneModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] animate-in fade-in duration-200"
          onClick={() => setShowZoneModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-slate-200 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                🏘️ Gắn phân khu
              </h3>
              <button
                onClick={() => setShowZoneModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl font-light transition-colors duration-200 hover:rotate-90 transform"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleZoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Chọn phân khu
                </label>
                <select
                  required
                  value={zoneForm.zone_id}
                  onChange={(e) => setZoneForm(prev => ({ ...prev, zone_id: e.target.value }))}
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                >
                  <option value="">-- Chọn phân khu --</option>
                  {zoneList?.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.ten_phan_khu}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200 hover:scale-[1.02]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savePlanningAreaZone.isPending}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {savePlanningAreaZone.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Area Modal */}
      {showAreaModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] animate-in fade-in duration-200"
          onClick={() => setShowAreaModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-slate-200 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                📋 Gắn hạng mục
              </h3>
              <button
                onClick={() => setShowAreaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl font-light transition-colors duration-200 hover:rotate-90 transform"
              >
                ×
              </button>
            </div>

            {/* Premium Tabs */}
            <div className="flex mb-8 bg-slate-100 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'new'
                    ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                  }`}
              >
                Tạo mới
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'existing'
                    ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                  }`}
              >
                Đã có trên phần mềm
              </button>
            </div>

            <form onSubmit={handleAreaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Chọn phân khu
                </label>
                <select
                  required
                  value={areaForm.zone_id}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, zone_id: e.target.value, block_id: '', block_name: '' }))}
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                >
                  <option value="">-- Chọn phân khu --</option>
                  {zoneList?.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.ten_phan_khu}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === 'new' ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Tên hạng mục
                  </label>
                  <input
                    type="text"
                    required
                    value={areaForm.block_name}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, block_name: e.target.value }))}
                    className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="Nhập tên hạng mục"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Chọn hạng mục có sẵn
                  </label>
                  <select
                    required
                    value={areaForm.block_id}
                    onChange={(e) => handleBlockChange(e.target.value)}
                    disabled={!areaForm.zone_id}
                    className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 transition-all duration-200 text-base"
                  >
                    <option value="">-- Chọn hạng mục --</option>
                    {blockList?.map((block) => (
                      <option key={block.block_id} value={block.block_id}>
                        {block.ten_block}
                      </option>
                    ))}
                  </select>
                  {!areaForm.zone_id && (
                    <p className="text-sm text-slate-500 mt-3">Vui lòng chọn phân khu trước</p>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200 hover:scale-[1.02]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savePlanningArea.isPending}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
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