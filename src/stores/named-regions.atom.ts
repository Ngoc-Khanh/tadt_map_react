import { atom } from 'jotai';
import type { Feature } from 'geojson';

export interface NamedRegion {
  id: string;
  name: string;
  feature: Feature;
  createdAt: Date;
  color: string;
}

// Base atom để lưu trữ danh sách các vùng được đặt tên
export const namedRegionsAtom = atom<NamedRegion[]>([]);

// Action atom để thêm vùng được đặt tên
export const addNamedRegionAtom = atom(
  null,
  (get, set, name: string, feature: Feature) => {
    const currentRegions = get(namedRegionsAtom);
    const regionId = Math.random().toString(36).substr(2, 9);
    
    const newRegion: NamedRegion = {
      id: regionId,
      name,
      feature,
      createdAt: new Date(),
      color: '#e74c3c' // Red color
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
    set(namedRegionsAtom, currentRegions.filter(r => r.id !== regionId));
  }
);

// Action atom để cập nhật tên vùng
export const updateNamedRegionAtom = atom(
  null,
  (get, set, regionId: string, newName: string) => {
    const currentRegions = get(namedRegionsAtom);
    set(namedRegionsAtom, currentRegions.map(r => 
      r.id === regionId ? { ...r, name: newName } : r
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
