import { useAtom, useSetAtom } from 'jotai';
import {
  namedRegionsAtom,
  addNamedRegionAtom,
  removeNamedRegionAtom,
  updateNamedRegionAtom,
  clearAllNamedRegionsAtom,
  type NamedRegion
} from '@/stores/named-regions.atom';
import type { Feature } from 'geojson';

export interface UseNamedRegionsReturn {
  namedRegions: NamedRegion[];
  addNamedRegion: (name: string, feature: Feature) => NamedRegion;
  removeNamedRegion: (regionId: string) => void;
  updateNamedRegion: (regionId: string, newName: string) => void;
  clearAllNamedRegions: () => void;
}

export function useNamedRegions(): UseNamedRegionsReturn {
  const [namedRegions] = useAtom(namedRegionsAtom);
  const addNamedRegion = useSetAtom(addNamedRegionAtom);
  const removeNamedRegion = useSetAtom(removeNamedRegionAtom);
  const updateNamedRegion = useSetAtom(updateNamedRegionAtom);
  const clearAllNamedRegions = useSetAtom(clearAllNamedRegionsAtom);

  return {
    namedRegions,
    addNamedRegion,
    removeNamedRegion,
    updateNamedRegion,
    clearAllNamedRegions
  };
}
