import type { ParsedKMLData } from '@/lib/kml-parser';
import type { Feature } from 'geojson';
import { LatLngBounds, Layer } from 'leaflet';
import { useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';

interface KMLLayerProps {
  data: ParsedKMLData;
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  fitBounds?: boolean;
  onFeatureClick?: (feature: Feature, layer: Layer) => void;
}

export function KMLLayer({
  data,
  color = '#e74c3c',
  weight = 2,
  fillColor = '#e74c3c',
  fillOpacity = 0.3,
  fitBounds = false,
  onFeatureClick,
}: KMLLayerProps) {
  const map = useMap();

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
    // Create popup content with feature properties and name region button
    if (feature.properties) {
      const properties = Object.entries(feature.properties)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>');

      // Generate consistent button ID
      const buttonId = `name-region-btn-${feature.id || Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;

      const popupContent = `
        <div style="font-family: Arial, sans-serif;">
          ${properties ? `<div style="margin-bottom: 12px;">${properties}</div>` : ''}
          <button 
            id="${buttonId}" 
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
              margin-top: 8px;
            "
            onmouseover="this.style.background='#2980b9'"
            onmouseout="this.style.background='#3498db'"
          >
        📍 Đặt tên block
          </button>
        </div>
      `;

      layer.bindPopup(popupContent, {
        maxWidth: 250,
        closeButton: true
      });

      // Add event listener for the name region button after popup opens
      layer.on('popupopen', () => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.onclick = (e) => {
            e.stopPropagation();
            layer.closePopup();
          };
        }
      });
    }

    // Add click handler
    if (onFeatureClick) {
      layer.on('click', () => {
        onFeatureClick(feature, layer);
      });
    }
  };

  return (
    <GeoJSON
      data={data}
      style={() => ({
        color,
        weight,
        fillColor,
        fillOpacity,
        opacity: 0.8
      })}
      onEachFeature={handleEachFeature}
    />
  );
}