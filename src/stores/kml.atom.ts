import { atom } from 'jotai';
import { KMLParser, type ParsedKMLData } from '@/utils/kml-parser';

export interface KMLFile {
  id: string;
  name: string;
  size: number;
  data: ParsedKMLData | null;
  status: 'pending' | 'parsing' | 'success' | 'error';
  error?: string;
  statistics?: {
    totalFeatures: number;
    points: number;
    lines: number;
    polygons: number;
    multiPolygons: number;
  };
  visible: boolean;
  color: string;
}

const defaultColors = [
  '#3498db', // blue
];

// Base atom để lưu trữ danh sách KML files
export const kmlFilesAtom = atom<KMLFile[]>([]);

// Derived atom để lấy KML data hiển thị
export const visibleKMLDataAtom = atom<ParsedKMLData[]>((get) => {
  const kmlFiles = get(kmlFilesAtom);
  return kmlFiles
    .filter(f => f.visible && f.status === 'success' && f.data)
    .map(f => f.data!);
});

// Action atom để thêm KML file
export const addKMLFileAtom = atom(
  null,
  async (get, set, file: File) => {
    const currentFiles = get(kmlFilesAtom);
    const fileId = Math.random().toString(36).substr(2, 9);
    const colorIndex = currentFiles.length % defaultColors.length;
    
    // Add file with pending status
    const newFile: KMLFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      data: null,
      status: 'pending',
      visible: true,
      color: defaultColors[colorIndex]
    };

    set(kmlFilesAtom, [...currentFiles, newFile]);

    try {
      // Update status to parsing
      set(kmlFilesAtom, (prev) => prev.map(f => 
        f.id === fileId ? { ...f, status: 'parsing' } : f
      ));

      // Parse the file
      const parsedData = await KMLParser.parseFile(file);
      
      if (!parsedData || !KMLParser.validateParsedData(parsedData)) {
        throw new Error('Invalid KML/KMZ file or no valid geometries found');
      }

      // Get statistics
      const statistics = KMLParser.getStatistics(parsedData);

      // Update with success
      set(kmlFilesAtom, (prev) => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'success', 
          data: parsedData,
          statistics
        } : f
      ));

    } catch (error) {
      console.error('Error processing KML file:', error);
      
      // Update with error
      set(kmlFilesAtom, (prev) => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));
    }
  }
);

// Action atom để xóa KML file
export const removeKMLFileAtom = atom(
  null,
  (get, set, fileId: string) => {
    const currentFiles = get(kmlFilesAtom);
    set(kmlFilesAtom, currentFiles.filter(f => f.id !== fileId));
  }
);

// Action atom để toggle visibility của KML file
export const toggleKMLFileVisibilityAtom = atom(
  null,
  (get, set, fileId: string) => {
    const currentFiles = get(kmlFilesAtom);
    set(kmlFilesAtom, currentFiles.map(f => 
      f.id === fileId ? { ...f, visible: !f.visible } : f
    ));
  }
);

// Action atom để cập nhật màu sắc KML file
export const updateKMLFileColorAtom = atom(
  null,
  (get, set, fileId: string, color: string) => {
    const currentFiles = get(kmlFilesAtom);
    set(kmlFilesAtom, currentFiles.map(f => 
      f.id === fileId ? { ...f, color } : f
    ));
  }
);

// Action atom để xóa tất cả KML files
export const clearAllKMLFilesAtom = atom(
  null,
  (_get, set) => {
    set(kmlFilesAtom, []);
  }
);
