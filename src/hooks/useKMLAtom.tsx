import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  kmlFilesAtom, 
  visibleKMLDataAtom,
  addKMLFileAtom,
  removeKMLFileAtom,
  toggleKMLFileVisibilityAtom,
  updateKMLFileColorAtom,
  clearAllKMLFilesAtom,
  type KMLFile
} from '@/stores/kml.atom';
import type { ParsedKMLData } from '@/utils/kml-parser';

export interface UseKMLDataReturn {
  kmlFiles: KMLFile[];
  addKMLFile: (file: File) => Promise<void>;
  removeKMLFile: (id: string) => void;
  toggleKMLFileVisibility: (id: string) => void;
  updateKMLFileColor: (id: string, color: string) => void;
  clearAllKMLFiles: () => void;
  getVisibleKMLData: () => ParsedKMLData[];
}

export function useKMLData(): UseKMLDataReturn {
  const [kmlFiles] = useAtom(kmlFilesAtom);
  const visibleKMLData = useAtomValue(visibleKMLDataAtom);
  const addKMLFile = useSetAtom(addKMLFileAtom);
  const removeKMLFile = useSetAtom(removeKMLFileAtom);
  const toggleKMLFileVisibility = useSetAtom(toggleKMLFileVisibilityAtom);
  const updateKMLFileColor = useSetAtom(updateKMLFileColorAtom);
  const clearAllKMLFiles = useSetAtom(clearAllKMLFilesAtom);

  const getVisibleKMLData = () => visibleKMLData;

  return {
    kmlFiles,
    addKMLFile,
    removeKMLFile,
    toggleKMLFileVisibility,
    updateKMLFileColor,
    clearAllKMLFiles,
    getVisibleKMLData
  };
}
