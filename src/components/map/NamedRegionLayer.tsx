import { GeoJSON } from 'react-leaflet';
import type { NamedRegion } from '@/stores/named-regions.atom';
import { Layer } from 'leaflet';
import type { Feature, GeoJsonTypes } from 'geojson';

interface NamedRegionLayerProps {
  namedRegion: NamedRegion;
  onFeatureClick?: (region: NamedRegion, layer: Layer) => void;
  color?: string; // Add optional color prop
}

export function NamedRegionLayer({ 
  namedRegion, 
  onFeatureClick,
  color = '#e74c3c' // Default color
}: NamedRegionLayerProps) {
  
  const handleEachFeature = (feature: Feature, layer: Layer) => {
    // Create popup content with region name
    const popupContent = `
      <div style="font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: ${color}; font-size: 16px;">
          Block: ${namedRegion.ten_block}
        </h4>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>Đặt tên lúc:</strong> ${namedRegion.createdAt.toLocaleString('vi-VN')}
        </p>
        ${feature.properties ? Object.entries(feature.properties)
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .slice(0, 3)
          .map(([key, value]) => `<p style="margin: 2px 0; font-size: 11px;"><strong>${key}:</strong> ${value}</p>`)
          .join('') : ''}
      </div>
    `;
    
    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'named-region-popup'
    });

    // Add click handler
    if (onFeatureClick) {
      layer.on('click', () => {
        onFeatureClick(namedRegion, layer);
      });
    }
  };

  // Convert IGeometry[] to GeoJSON FeatureCollection
  const convertToGeoJSON = () => {
    if (!namedRegion.geometry || namedRegion.geometry.length === 0) {
      return null;
    }

    return {
      type: 'FeatureCollection' as const,
      features: namedRegion.geometry.map((geom, index) => ({
        type: 'Feature' as const,
        id: `${namedRegion.block_id}-${index}`,
        geometry: {
          type: geom.type as GeoJsonTypes,
          coordinates: geom.coordinates
        },
        properties: geom.properties || {}
      }))
    };
  };

  const geoJsonData = convertToGeoJSON();

  if (!geoJsonData) {
    return null;
  }

  return (
    <GeoJSON
      key={namedRegion.block_id}
      data={geoJsonData}
      style={() => ({
        color: color,
        weight: 3,
        fillColor: color,
        fillOpacity: 0.4,
        opacity: 1,
        dashArray: '5, 5' // Dashed line to distinguish from regular features
      })}
      onEachFeature={handleEachFeature}
    />
  );
}
