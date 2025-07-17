import { atom } from 'jotai';
import type { LayerGroup, SuccessfulFile } from '@/data/interfaces';

// Atom để lưu trữ các layer groups đã upload
export const layerGroupsAtom = atom<LayerGroup[]>([]);

// Atom để lưu trữ các file đã upload thành công
export const successfulFilesAtom = atom<SuccessfulFile[]>([]);

// Atom để điều khiển việc fit bounds trên map
export const shouldFitBoundsAtom = atom<[[number, number], [number, number]] | null>(null);

// Action atoms
export const addLayerGroupAtom = atom(
  null,
  (get, set, layerGroup: LayerGroup) => {
    const current = get(layerGroupsAtom);
    set(layerGroupsAtom, [...current, layerGroup]);
  }
);

export const addSuccessfulFileAtom = atom(
  null,
  (get, set, file: SuccessfulFile) => {
    const current = get(successfulFilesAtom);
    set(successfulFilesAtom, [...current, file]);
  }
);

export const setShouldFitBoundsAtom = atom(
  null,
  (_get, set, bounds: [[number, number], [number, number]] | null) => {
    set(shouldFitBoundsAtom, bounds);
  }
);

export const clearAllDataAtom = atom(
  null,
  (_get, set) => {
    set(layerGroupsAtom, []);
    set(successfulFilesAtom, []);
    set(shouldFitBoundsAtom, null);
  }
);

// Atom để lưu trữ trạng thái importing
export const isImportingAtom = atom<boolean>(false);
