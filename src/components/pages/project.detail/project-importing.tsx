import { routes } from "@/config";
import { useKMLData } from "@/hooks";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useImportState } from "@/hooks/useImportState";
import { ArrowLeft, CloudUpload, Description, Map } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Divider, IconButton, LinearProgress, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { TbFile, TbUpload, TbX } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

interface IProjectImportingProps {
  projectId: string;
}

export function ProjectImporting({ projectId }: IProjectImportingProps) {
  const navigate = useNavigate();
  const { closeImport } = useImportState();
  const { kmlFiles, addKMLFile, removeKMLFile, clearAllKMLFiles } = useKMLData();

  const {
    files,
    isDragOver,
    isUploading,
    formatFileSize,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile: removeUploadFile,
    clearAllFiles,
  } = useFileUpload();

  const successfulKMLFiles = kmlFiles.filter(f => f.status === 'success');
  const hasSuccessfulFiles = successfulKMLFiles.length > 0;

  // Filter function for KML/KMZ files
  const kmlFileFilter = useCallback((file: File) =>
    file.name.toLowerCase().endsWith('.kml') ||
    file.name.toLowerCase().endsWith('.kmz'), []);

  // Custom drop handler that only adds files to upload list
  const handleKMLDrop = useCallback((e: React.DragEvent) => {
    handleDrop(e, kmlFileFilter);
  }, [handleDrop, kmlFileFilter]);

  // Custom file select handler that only adds files to upload list
  const handleKMLFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e, kmlFileFilter);
  }, [handleFileSelect, kmlFileFilter]);

  const removeFile = useCallback((fileId: string) => {
    // Check if it's a KML file and remove from KML data
    const kmlFile = kmlFiles.find(f => f.id === fileId);
    if (kmlFile) {
      removeKMLFile(fileId);
    } else {
      // Remove from upload files
      removeUploadFile(fileId);
    }
  }, [kmlFiles, removeKMLFile, removeUploadFile]);

  const startImport = useCallback(async () => {
    // Process files through KML system when user clicks import
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const uploadFile of pendingFiles) {
      if (uploadFile.file) {
        try {
          // Process through KML system
          await addKMLFile(uploadFile.file);
        } catch (error) {
          console.error('Failed to process file:', uploadFile.name, error);
        }
      }
    }

    // Clear all pending files after processing
    clearAllFiles();
  }, [files, addKMLFile, clearAllFiles]);

  return (
    <Box className="h-full" sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box className="mx-auto">
        {/* Header */}
        <Box className="mb-6">
          {closeImport && (
            <Box
              onClick={closeImport}
              className="flex items-center gap-2 mb-4 cursor-pointer w-fit transition-colors"
              sx={{
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ArrowLeft sx={{ color: 'primary.main' }} />
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 'medium'
                }}
              >
                Quay lại
              </Typography>
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Import KML/KMZ Files
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Tải lên các file KML hoặc KMZ để hiển thị trên bản đồ
          </Typography>

          <Stack direction="row" spacing={1}>
            <Chip label="Hỗ trợ: .kml, .kmz" size="small" variant="outlined" />
            <Chip label="Tối đa: 10MB/file" size="small" variant="outlined" />
          </Stack>
        </Box>

        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Box>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragOver ? 'primary.main' : 'grey.300',
                bgcolor: isDragOver ? 'primary.50' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
              onDrop={handleKMLDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CloudUpload
                sx={{
                  fontSize: 48,
                  color: isDragOver ? 'primary.main' : 'grey.400',
                  mb: 2
                }}
              />
              <Typography variant="h6" gutterBottom>
                Kéo thả file vào đây
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                hoặc click để chọn file từ máy tính
              </Typography>

              <input
                type="file"
                multiple
                accept=".kml,.kmz"
                onChange={handleKMLFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<TbUpload />}
                  sx={{ borderRadius: 2 }}
                >
                  Chọn file
                </Button>
              </label>
            </Paper>

            {files.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={startImport}
                  disabled={isUploading}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': { boxShadow: 3 }
                  }}
                  fullWidth
                >
                  Bắt đầu Import ({files.length} file)
                </Button>
              </Box>
            )}
          </Box>

          {/* File List */}
          <Box>
            <Paper sx={{ p: 3, maxHeight: 500, overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Danh sách file ({files.length + kmlFiles.length})
                </Typography>
                {(kmlFiles.length > 0 || files.length > 0) && (
                  <Stack direction="row" spacing={1}>
                    {files.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => files.forEach(f => removeUploadFile(f.id))}
                        sx={{ borderRadius: 2 }}
                      >
                        Xóa file chờ ({files.length})
                      </Button>
                    )}
                    {kmlFiles.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={clearAllKMLFiles}
                        sx={{ borderRadius: 2 }}
                      >
                        Xóa KML ({kmlFiles.length})
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>

              {kmlFiles.length === 0 && files.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography color="text.secondary">
                    Chưa có file nào được chọn
                  </Typography>
                </Box>
              ) : (
                <List>
                  {/* Display KML files (successfully processed) */}
                  {kmlFiles.map((file, index) => (
                    <Box key={file.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <TbFile className="w-6 h-6 text-green-500" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap component="div">
                              {file.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                              {file.status === 'parsing' && (
                                <Box sx={{ mt: 1 }}>
                                  <LinearProgress sx={{ borderRadius: 1 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Đang phân tích KML...
                                  </Typography>
                                </Box>
                              )}
                              {file.statistics && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Tổng: {file.statistics.totalFeatures} đối tượng
                                  {file.statistics.points > 0 && ` | Điểm: ${file.statistics.points}`}
                                  {file.statistics.lines > 0 && ` | Đường: ${file.statistics.lines}`}
                                  {file.statistics.polygons > 0 && ` | Vùng: ${file.statistics.polygons}`}
                                </Typography>
                              )}
                              {file.error && (
                                <Typography variant="caption" color="error" display="block">
                                  Lỗi: {file.error}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={
                                file.status === 'pending' ? 'Chờ' :
                                  file.status === 'parsing' ? 'Đang xử lý' :
                                    file.status === 'success' ? 'Thành công' : 'Lỗi'
                              }
                              size="small"
                              color={
                                file.status === 'success' ? 'success' :
                                  file.status === 'error' ? 'error' :
                                    file.status === 'parsing' ? 'warning' : 'default'
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeFile(file.id)}
                              disabled={file.status === 'parsing'}
                            >
                              <TbX className="w-4 h-4" />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < kmlFiles.length - 1 && <Divider />}
                    </Box>
                  ))}

                  {/* Add divider between KML files and upload files if both exist */}
                  {kmlFiles.length > 0 && files.length > 0 && <Divider />}

                  {/* Display pending upload files */}
                  {files.map((file, index) => (
                    <Box key={file.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <TbFile className="w-6 h-6 text-blue-500" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {file.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                              {file.status === 'uploading' && (
                                <Box sx={{ mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={file.progress || 0}
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {file.progress}%
                                  </Typography>
                                </Box>
                              )}
                              {file.error && (
                                <Typography variant="caption" color="error" display="block">
                                  Lỗi: {file.error}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={
                                file.status === 'pending' ? 'Chờ xử lý' :
                                  file.status === 'uploading' ? 'Đang xử lý' :
                                    file.status === 'success' ? 'Thành công' : 'Lỗi'
                              }
                              size="small"
                              color={
                                file.status === 'success' ? 'success' :
                                  file.status === 'error' ? 'error' :
                                    file.status === 'uploading' ? 'warning' : 'default'
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeFile(file.id)}
                              disabled={file.status === 'uploading'}
                            >
                              <TbX className="w-4 h-4" />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < files.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Preview Map Button */}
        {hasSuccessfulFiles && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Map />}
              onClick={() => navigate(routes.mapPreview(projectId!), { state: { kmlFiles: successfulKMLFiles } })}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}
            >
              Xem bản đồ KML ({successfulKMLFiles.length} file)
            </Button>
          </Box>
        )}

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> File KML/KMZ sẽ được phân tích và hiển thị trên bản đồ.
            Đảm bảo file của bạn có cấu trúc dữ liệu hợp lệ và không vượt quá giới hạn kích thước.
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}