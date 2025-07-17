import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { IBlockWithGeometry, IGeometry } from '@/data/interfaces';
import type { ETrangThaiType } from '@/data/enums';
import { ETrangThai } from '@/data/enums';
import type { Feature, Polygon, LineString } from 'geojson';

export interface NamedRegion extends IBlockWithGeometry {
  // Kế thừa từ IBlock
  block_id: string;
  ten_block: string;
  zone_id: string;
  trang_thai: ETrangThaiType;
  tien_do_thuc_te: number;
  loai_block?: string;
  // Kế thừa từ IBlockWithGeometry
  geometry: IGeometry[];
  // Thêm thông tin đặc biệt cho named regions
  createdAt: Date;
  isNamedRegion: true; // Flag để phân biệt với block thường
}

// Base atom để lưu trữ danh sách các vùng được đặt tên với localStorage persistence
export const namedRegionsAtom = atomWithStorage<NamedRegion[]>('named-regions', [], {
  getItem: (key) => {
    const item = localStorage.getItem(key);
    if (!item) return [];
    try {
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      return parsed.map((region: NamedRegion & { createdAt: string }) => ({
        ...region,
        createdAt: new Date(region.createdAt)
      }));
    } catch {
      return [];
    }
  },
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  }
});

// Action atom để thêm vùng được đặt tên từ GeoJSON Feature
export const addNamedRegionAtom = atom(
  null,
  (get, set, name: string, feature: Feature) => {
    const currentRegions = get(namedRegionsAtom);
    const regionId = Math.random().toString(36).substr(2, 9);
    
    // Chuyển đổi GeoJSON Feature thành IGeometry format
    const getCoordinates = () => {
      if (feature.geometry?.type === 'Polygon') {
        const coords = (feature.geometry as Polygon).coordinates[0];
        return coords.map(coord => [coord[0], coord[1], 0] as [number, number, number]);
      } else if (feature.geometry?.type === 'LineString') {
        const coords = (feature.geometry as LineString).coordinates;
        return coords.map(coord => [coord[0], coord[1], 0] as [number, number, number]);
      }
      return [];
    };

    const geometry: IGeometry[] = [{
      type: 'LineString',
      coordinates: getCoordinates(),
      properties: {
        name: name,
        description: `Named region: ${name}`,
      },
    }];

    const newRegion: NamedRegion = {
      block_id: regionId,
      ten_block: name,
      zone_id: 'named-region-zone',
      trang_thai: ETrangThai.CREATED,
      tien_do_thuc_te: 100,
      loai_block: 'named-region',
      geometry: geometry,
      createdAt: new Date(),
      isNamedRegion: true,
    };

    set(namedRegionsAtom, [...currentRegions, newRegion]);
    return newRegion;
  }
);

// Action atom để xóa vùng được đặt tên
export const removeNamedRegionAtom = atom(
  null,
  (get, set, regionId: string) => {
    const currentRegions = get(namedRegionsAtom);
    set(namedRegionsAtom, currentRegions.filter(r => r.block_id !== regionId));
  }
);

// Action atom để cập nhật tên vùng
export const updateNamedRegionAtom = atom(
  null,
  (get, set, regionId: string, newName: string) => {
    const currentRegions = get(namedRegionsAtom);
    set(namedRegionsAtom, currentRegions.map(r => 
      r.block_id === regionId ? { ...r, ten_block: newName } : r
    ));
  }
);

// Action atom để xóa tất cả vùng được đặt tên
export const clearAllNamedRegionsAtom = atom(
  null,
  (_get, set) => {
    set(namedRegionsAtom, []);
  }
);
