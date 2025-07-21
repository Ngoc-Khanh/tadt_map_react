import * as toGeoJSON from '@tmcw/togeojson';
import JSZip from 'jszip';

export interface KMLFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    name?: string;
    description?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export interface ParsedKMLData {
  type: 'FeatureCollection';
  features: KMLFeature[];
}

export class KMLParser {
  /**
   * Parse KML string to GeoJSON
   */
  static parseKML(kmlString: string): ParsedKMLData | null {
    try {
      const parser = new DOMParser();
      const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
      const geoJson = toGeoJSON.kml(kmlDoc);
      return geoJson as ParsedKMLData;
    } catch (error) {
      console.error('Error parsing KML:', error);
      return null;
    }
  }

  /**
   * Parse KMZ file (ZIP containing KML)
   */
  static async parseKMZ(kmzFile: File): Promise<ParsedKMLData | null> {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(kmzFile);
      // Find KML file in the archive
      const kmlFile = Object.keys(contents.files).find(filename => filename.toLowerCase().endsWith('.kml'));
      if (!kmlFile) throw new Error('No KML file found in KMZ archive');
      const kmlContent = await contents.files[kmlFile].async('string');
      return this.parseKML(kmlContent);
    } catch (error) {
      console.error('Error parsing KMZ:', error);
      return null;
    }
  }

  /**
   * Parse file based on extension
   */
  static async parseFile(file: File): Promise<ParsedKMLData | null> {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.kml')) {
      const content = await file.text();
      return this.parseKML(content);
    } else if (fileName.endsWith('.kmz')) return this.parseKMZ(file);
    else throw new Error('Unsupported file type. Only KML and KMZ files are supported.');
  }

  /**
   * Validate if the parsed data contains valid geometries
   */
  static validateParsedData(data: ParsedKMLData | null): boolean {
    if (!data || !data.features || data.features.length === 0) return false;
    return data.features.some(feature => 
      feature.geometry && 
      feature.geometry.coordinates && 
      feature.geometry.coordinates.length > 0
    );
  }

  /**
   * Get bounding box from parsed data
   */
  static getBounds(data: ParsedKMLData): [[number, number], [number, number]] | null {
    if (!data.features || data.features.length === 0) return null;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    data.features.forEach(feature => {
      const { geometry } = feature;
      if (!geometry.coordinates) return;
      const extractCoords = (coords: number[] | number[][] | number[][][]): void => {
        if (typeof coords[0] === 'number') {
          // Single coordinate pair
          const [lng, lat] = coords as number[];
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        } else if (Array.isArray(coords[0])) {
          // Array of coordinates
          (coords as number[][] | number[][][]).forEach((coord) => extractCoords(coord));
        }
      };
      extractCoords(geometry.coordinates);
    });
    if (minLat === Infinity) return null;
    return [[minLat, minLng], [maxLat, maxLng]];
  }

  /**
   * Convert coordinates for Leaflet (swap lng/lat)
   */
  static convertCoordsForLeaflet(coords: number[]): [number, number] {
    return [coords[1], coords[0]]; // [lat, lng]
  }

  /**
   * Get statistics about the parsed data
   */
  static getStatistics(data: ParsedKMLData): {
    totalFeatures: number;
    points: number;
    lines: number;
    polygons: number;
    multiPolygons: number;
  } {
    if (!data.features) return { totalFeatures: 0, points: 0, lines: 0, polygons: 0, multiPolygons: 0 };
    const stats = {
      totalFeatures: data.features.length,
      points: 0,
      lines: 0,
      polygons: 0,
      multiPolygons: 0
    };
    data.features.forEach(feature => {
      switch (feature.geometry.type) {
        case 'Point':
          stats.points++;
          break;
        case 'LineString':
          stats.lines++;
          break;
        case 'Polygon':
          stats.polygons++;
          break;
        case 'MultiPolygon':
          stats.multiPolygons++;
          break;
      }
    });
    return stats;
  }
}