import { useCallback, useState } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  file?: File;
}

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' as const,
      file
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
    return uploadedFiles;
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const updateFileStatus = useCallback((fileId: string, status: UploadedFile['status'], progress?: number, error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, progress, error }
        : file
    ));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const startUpload = useCallback(async (fileId: string, uploadFn?: (file: File) => Promise<void>) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !file.file) return;

    updateFileStatus(fileId, 'uploading', 0);

    try {
      if (uploadFn) {
        await uploadFn(file.file);
      } else {
        // Default simulation upload
        await simulateUpload(fileId, updateFileStatus);
      }
      updateFileStatus(fileId, 'success', 100);
    } catch (error) {
      updateFileStatus(fileId, 'error', 0, error instanceof Error ? error.message : 'Upload failed');
    }
  }, [files, updateFileStatus]);

  const startBatchUpload = useCallback(async (uploadFn?: (file: File) => Promise<void>) => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      // Add delay between uploads
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      await startUpload(file.id, uploadFn);
    }
  }, [files, startUpload]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, fileFilter?: (file: File) => boolean) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = fileFilter ? droppedFiles.filter(fileFilter) : droppedFiles;
    
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, fileFilter?: (file: File) => boolean) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = fileFilter ? selectedFiles.filter(fileFilter) : selectedFiles;
    
    if (validFiles.length > 0) {
      addFiles(validFiles);
    }

    // Reset input value
    e.target.value = '';
  }, [addFiles]);

  // Utility functions
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFilesByStatus = useCallback((status: UploadedFile['status']) => {
    return files.filter(file => file.status === status);
  }, [files]);

  const isUploading = files.some(file => file.status === 'uploading');
  const hasFiles = files.length > 0;
  const successfulFiles = getFilesByStatus('success');
  const errorFiles = getFilesByStatus('error');
  const pendingFiles = getFilesByStatus('pending');

  return {
    // State
    files,
    isDragOver,
    isUploading,
    hasFiles,
    successfulFiles,
    errorFiles,
    pendingFiles,

    // Actions
    addFiles,
    removeFile,
    updateFileStatus,
    clearAllFiles,
    startUpload,
    startBatchUpload,

    // Drag & Drop handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,

    // Utilities
    formatFileSize,
    getFilesByStatus,
  };
}

// Helper function for simulating upload progress
async function simulateUpload(
  fileId: string, 
  updateFileStatus: (fileId: string, status: UploadedFile['status'], progress?: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateFileStatus(fileId, 'uploading', progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });
}
