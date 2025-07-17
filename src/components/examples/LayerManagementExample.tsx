// Example usage of the new hooks and atoms

import { useUploadFiles } from '@/hooks/useUploadFiles';
import { useLayerGroupsData, useSuccessfulFilesData } from '@/hooks/useLayerData';
import { 
  layerGroupsAtom, 
  successfulFilesAtom, 
  shouldFitBoundsAtom,
  isImportingAtom 
} from '@/stores/layer.atom';
import { useAtomValue } from 'jotai';

// Component example
export function LayerManagementExample() {
  // Hook để upload files
  const {
    files,
    isImporting,
    addFiles,
    removeFile,
    clearAll,
    importFiles,
    isLoading
  } = useUploadFiles();

  // Hook để lấy layer groups data với React Query
  const { data: layerGroups, isLoading: isLoadingGroups } = useLayerGroupsData();
  
  // Hook để lấy successful files data với React Query  
  const { data: successfulFiles, isLoading: isLoadingFiles } = useSuccessfulFilesData();

  // Hoặc sử dụng trực tiếp atoms
  const currentLayerGroups = useAtomValue(layerGroupsAtom);
  const currentSuccessfulFiles = useAtomValue(successfulFilesAtom);
  const shouldFitBounds = useAtomValue(shouldFitBoundsAtom);
  const isImportingState = useAtomValue(isImportingAtom);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  return (
    <div>
      <h2>Layer Management</h2>
      
      {/* File upload */}
      <input
        type="file"
        multiple
        accept=".kml,.kmz"
        onChange={handleFileUpload}
      />
      
      {/* Import button */}
      <button 
        onClick={importFiles}
        disabled={isImporting || isLoading}
      >
        {isImporting || isLoading ? 'Importing...' : 'Import Files'}
      </button>

      {/* Clear all */}
      <button onClick={clearAll}>
        Clear All Files
      </button>

      {/* Display files */}
      <div>
        <h3>Upload Files ({files.length})</h3>
        {files.map(file => (
          <div key={file.id}>
            <span>{file.name} - {file.status}</span>
            <button onClick={() => removeFile(file.id)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Display layer groups */}
      <div>
        <h3>Layer Groups ({layerGroups?.length || 0})</h3>
        {isLoadingGroups ? (
          <p>Loading layer groups...</p>
        ) : (
          layerGroups?.map(group => (
            <div key={group.id}>
              <h4>{group.name}</h4>
              <p>Layers: {group.layers.length}</p>
              <p>Visible: {group.visible ? 'Yes' : 'No'}</p>
            </div>
          ))
        )}
      </div>

      {/* Display successful files */}
      <div>
        <h3>Successful Files ({successfulFiles?.length || 0})</h3>
        {isLoadingFiles ? (
          <p>Loading successful files...</p>
        ) : (
          successfulFiles?.map(file => (
            <div key={file.id}>
              <span>{file.name} - Layer Group: {file.layerGroupId}</span>
            </div>
          ))
        )}
      </div>

      {/* Debug info */}
      <div>
        <h3>Debug Info</h3>
        <p>Should Fit Bounds: {shouldFitBounds ? 'Yes' : 'No'}</p>
        <p>Is Importing: {isImportingState ? 'Yes' : 'No'}</p>
        <p>Current Layer Groups (Atom): {currentLayerGroups.length}</p>
        <p>Current Successful Files (Atom): {currentSuccessfulFiles.length}</p>
      </div>
    </div>
  );
}
