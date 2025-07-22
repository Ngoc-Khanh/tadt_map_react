import type { Geometry, Polygon, LineString, MultiPolygon, MultiLineString } from 'geojson';

/**
 * Convert GeoJSON coordinates to WKT format
 */
export class GeometryConverter {
  /**
   * Convert GeoJSON geometry to POLYGON WKT format
   * @param geometry GeoJSON geometry object
   * @returns WKT POLYGON string
   */
  static toPolygonWKT(geometry: Geometry): string {
    // Handle different geometry types
    if (geometry.type === 'Polygon') {
      const polygonGeom = geometry as Polygon;
      return this.formatPolygon(polygonGeom.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
      // For MultiPolygon, take the first polygon
      const multiPolygonGeom = geometry as MultiPolygon;
      const firstPolygon = multiPolygonGeom.coordinates[0];
      return this.formatPolygon(firstPolygon);
    } else if (geometry.type === 'LineString') {
      // Convert LineString to Polygon by closing the ring
      const lineStringGeom = geometry as LineString;
      const polygonCoords = this.closeRing(lineStringGeom.coordinates);
      return this.formatPolygon([polygonCoords]);
    } else {
      throw new Error(`Unsupported geometry type for POLYGON: ${geometry.type}`);
    }
  }

  /**
   * Convert GeoJSON geometry to LINESTRING WKT format
   * @param geometry GeoJSON geometry object
   * @returns WKT LINESTRING string
   */
  static toLineStringWKT(geometry: Geometry): string {
    // Handle different geometry types
    if (geometry.type === 'LineString') {
      const lineStringGeom = geometry as LineString;
      return this.formatLineString(lineStringGeom.coordinates);
    } else if (geometry.type === 'Polygon') {
      // For Polygon, take the exterior ring
      const polygonGeom = geometry as Polygon;
      const exteriorRing = polygonGeom.coordinates[0];
      return this.formatLineString(exteriorRing);
    } else if (geometry.type === 'MultiLineString') {
      // For MultiLineString, take the first line
      const multiLineStringGeom = geometry as MultiLineString;
      const firstLine = multiLineStringGeom.coordinates[0];
      return this.formatLineString(firstLine);
    } else {
      throw new Error(`Unsupported geometry type for LINESTRING: ${geometry.type}`);
    }
  }

  /**
   * Format coordinates as POLYGON WKT
   */
  private static formatPolygon(rings: number[][][]): string {
    const formattedRings = rings.map(ring => {
      const coordStr = ring.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
      return `(${coordStr})`;
    });
    
    return `POLYGON(${formattedRings.join(', ')})`;
  }

  /**
   * Format coordinates as LINESTRING WKT
   */
  private static formatLineString(coords: number[][]): string {
    const coordStr = coords.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
    return `LINESTRING(${coordStr})`;
  }

  /**
   * Close a ring by ensuring the first and last points are the same
   */
  private static closeRing(coords: number[][]): number[][] {
    if (coords.length < 3) {
      throw new Error('Ring must have at least 3 coordinates');
    }

    const firstPoint = coords[0];
    const lastPoint = coords[coords.length - 1];
    
    // Check if ring is already closed
    if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
      return coords;
    }
    
    // Close the ring
    return [...coords, firstPoint];
  }

  /**
   * Convert WKT to WKB format (simplified - returns WKT for now)
   * In a real implementation, you might want to use a proper WKB library
   */
  static toWKB(wkt: string): string {
    // For now, return WKT format as placeholder
    // In production, you might want to convert to actual WKB binary format
    return wkt;
  }
} 