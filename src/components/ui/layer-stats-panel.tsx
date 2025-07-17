import React from 'react'
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  Chip, 
  Typography, 
  LinearProgress, 
  IconButton,
  Tooltip
} from '@mui/material'
import { 
  Layers, 
  Refresh, 
  Close,
  Visibility,
  VisibilityOff,
  Assignment,
  LocationOn,
  Delete,
  ColorLens
} from '@mui/icons-material'
import { useAtom, useSetAtom } from 'jotai'
import { 
  kmlFilesAtom, 
  toggleKMLFileVisibilityAtom,
  removeKMLFileAtom,
  updateKMLFileColorAtom
} from '@/stores/kml.atom'
import type { KMLFile } from '@/stores/kml.atom'

interface LayerStatsPanelProps {
  open: boolean
  onClose: () => void
  onRefresh?: () => void
  isLoading?: boolean
  error?: string
  onNavigateToLayer?: (bounds: [[number, number], [number, number]]) => void
  isFullPanel?: boolean
}

// Helper function để tính toán thống kê
const calculateLayerStats = (kmlFiles: KMLFile[]) => {
  const stats = {
    totalFiles: kmlFiles.length,
    totalFeatures: 0,
    visibleFiles: 0,
    lineStrings: 0,
    polygons: 0,
    points: 0,
    successfulFiles: 0,
    errorFiles: 0
  }

  kmlFiles.forEach(file => {
    if (file.status === 'success') {
      stats.successfulFiles++
      if (file.visible) {
        stats.visibleFiles++
      }
      
      if (file.statistics) {
        stats.totalFeatures += file.statistics.totalFeatures
        stats.lineStrings += file.statistics.lines
        stats.polygons += file.statistics.polygons + file.statistics.multiPolygons
        stats.points += file.statistics.points
      }
    } else if (file.status === 'error') {
      stats.errorFiles++
    }
  })

  return stats
}

// Helper function để format tên file
const formatFileName = (name: string) => {
  if (name.length > 30) {
    return name.substring(0, 30) + '...'
  }
  return name
}

// Helper function để lấy bounds từ KML file
const getKMLFileBounds = (file: KMLFile): [[number, number], [number, number]] | null => {
  if (!file.data || !file.data.features || file.data.features.length === 0) {
    return null
  }

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity

  file.data.features.forEach(feature => {
    if (feature.geometry) {
      const processCoordinates = (coords: number[] | number[][] | number[][][]) => {
        if (feature.geometry.type === 'Point') {
          const [lng, lat] = coords as number[]
          if (typeof lng === 'number' && typeof lat === 'number') {
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
          }
        } else if (feature.geometry.type === 'LineString') {
          (coords as number[][]).forEach((coord) => {
            const [lng, lat] = coord
            if (typeof lng === 'number' && typeof lat === 'number') {
              minLat = Math.min(minLat, lat)
              maxLat = Math.max(maxLat, lat)
              minLng = Math.min(minLng, lng)
              maxLng = Math.max(maxLng, lng)
            }
          })
        } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          const flattenCoords = (coordArray: number[][] | number[][][]): void => {
            if (Array.isArray(coordArray[0]) && Array.isArray(coordArray[0][0])) {
              (coordArray as number[][][]).forEach(flattenCoords)
            } else if (Array.isArray(coordArray[0])) {
              (coordArray as number[][]).forEach((coord) => {
                const [lng, lat] = coord
                if (typeof lng === 'number' && typeof lat === 'number') {
                  minLat = Math.min(minLat, lat)
                  maxLat = Math.max(maxLat, lat)
                  minLng = Math.min(minLng, lng)
                  maxLng = Math.max(maxLng, lng)
                }
              })
            }
          }
          flattenCoords(coords as number[][] | number[][][])
        }
      }

      processCoordinates(feature.geometry.coordinates)
    }
  })

  if (minLat !== Infinity && maxLat !== -Infinity && minLng !== Infinity && maxLng !== -Infinity) {
    return [[minLat, minLng], [maxLat, maxLng]]
  }

  return null
}

const colorOptions = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e67e22', '#8e44ad', '#27ae60'
]

export const LayerStatsPanel: React.FC<LayerStatsPanelProps> = React.memo(({
  open,
  onClose,
  onRefresh,
  isLoading = false,
  error,
  onNavigateToLayer,
  isFullPanel = false
}) => {
  const [kmlFiles] = useAtom(kmlFilesAtom)
  const toggleFileVisibility = useSetAtom(toggleKMLFileVisibilityAtom)
  const removeFile = useSetAtom(removeKMLFileAtom)
  const updateFileColor = useSetAtom(updateKMLFileColorAtom)

  // Memoize stats calculation để tránh re-calculation không cần thiết
  const stats = React.useMemo(() => calculateLayerStats(kmlFiles), [kmlFiles])

  const handleFileClick = React.useCallback((file: KMLFile) => {
    // Focus vào file được chọn bằng cách navigate đến bounds của nó
    if (onNavigateToLayer && file.data) {
      const bounds = getKMLFileBounds(file)
      if (bounds) {
        onNavigateToLayer(bounds)
      }
    }
  }, [onNavigateToLayer])

  const handleNavigateToFile = React.useCallback((file: KMLFile) => {
    if (!onNavigateToLayer) return

    const bounds = getKMLFileBounds(file)
    if (bounds) {
      onNavigateToLayer(bounds)
    }
  }, [onNavigateToLayer])

  const handleColorChange = React.useCallback((fileId: string, color: string) => {
    updateFileColor(fileId, color)
  }, [updateFileColor])

  if (!open) return null

  // Content component để tránh code duplication
  const PanelContent = () => (
    <>
      {isLoading && (
        <Box display="flex" justifyContent="center" py={2}>
          <Typography variant="body2" color="text.secondary">
            Đang tải...
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="body2" color="error.contrastText">
            {error}
          </Typography>
        </Box>
      )}

      {!isLoading && !error && (
        <>
          {/* Thống kê tổng quan */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.successfulFiles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng số files
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.totalFeatures}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng số features
                </Typography>
              </Box>
            </Box>

            {/* Progress bar cho visible files */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">Files hiển thị</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {stats.visibleFiles}/{stats.successfulFiles}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.successfulFiles > 0 ? (stats.visibleFiles / stats.successfulFiles) * 100 : 0}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>

            {/* Thống kê theo loại geometry */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${stats.lineStrings} LineString`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${stats.polygons} Polygon`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${stats.points} Point`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>

            {/* Error files */}
            {stats.errorFiles > 0 && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${stats.errorFiles} file lỗi`}
                  size="small"
                  color="error"
                  variant="filled"
                />
              </Box>
            )}
          </Box>

          {/* Danh sách KML files */}
          {kmlFiles.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Danh sách KML files:
              </Typography>
              <Box
                sx={{
                  maxHeight: isFullPanel ? 'none' : 320,
                  overflow: 'auto',
                  pr: 1,
                  mb: 2,
                  '&::-webkit-scrollbar': {
                    width: 6
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                    borderRadius: 3
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: 3,
                    '&:hover': {
                      backgroundColor: 'grey.600'
                    }
                  }
                }}
              >
                <List dense>
                  {kmlFiles.map((file) => {
                    const fileFeatures = file.statistics?.totalFeatures || 0
                    
                    return (
                      <ListItemButton
                        key={file.id}
                        sx={{
                          px: 1,
                          py: 0.5,
                          mb: 0.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: file.status === 'success' ? 'grey.200' : 
                                     file.status === 'error' ? 'error.main' : 'warning.main',
                          backgroundColor: file.status === 'success' ? 
                            (file.visible ? 'primary.50' : 'grey.50') : 
                            file.status === 'error' ? 'error.50' : 'warning.50',
                          '&:hover': {
                            backgroundColor: file.status === 'success' ? 
                              (file.visible ? 'primary.100' : 'grey.100') : 
                              file.status === 'error' ? 'error.100' : 'warning.100'
                          }
                        }}
                        onClick={() => handleFileClick(file)}
                        disabled={file.status !== 'success'}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {file.status === 'success' && (
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: file.color,
                                borderRadius: '50%',
                                border: '2px solid white',
                                boxShadow: 1
                              }}
                            />
                          )}
                          {file.status === 'error' && (
                            <Assignment color="error" fontSize="small" />
                          )}
                          {(file.status === 'pending' || file.status === 'parsing') && (
                            <Assignment color="action" fontSize="small" />
                          )}
                        </ListItemIcon>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={file.visible ? 'bold' : 'normal'}
                            color={file.status === 'error' ? 'error.main' : 'inherit'}
                          >
                            {formatFileName(file.name)}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                            {file.status === 'success' && (
                              <Chip
                                label={`${fileFeatures} features`}
                                size="small"
                                color="info"
                                variant="filled"
                              />
                            )}
                            
                            {file.status === 'error' && (
                              <Chip
                                label="Lỗi"
                                size="small"
                                color="error"
                                variant="filled"
                              />
                            )}
                            
                            {(file.status === 'pending' || file.status === 'parsing') && (
                              <Chip
                                label={file.status === 'parsing' ? 'Đang xử lý...' : 'Chờ xử lý'}
                                size="small"
                                color="warning"
                                variant="filled"
                              />
                            )}

                            {file.status === 'success' && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFileVisibility(file.id)
                                  }}
                                  sx={{ p: 0.5 }}
                                  title={file.visible ? 'Ẩn file' : 'Hiện file'}
                                >
                                  {file.visible ? (
                                    <Visibility fontSize="small" color="action" />
                                  ) : (
                                    <VisibilityOff fontSize="small" color="action" />
                                  )}
                                </IconButton>
                                
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNavigateToFile(file)
                                  }}
                                  sx={{ p: 0.5 }}
                                  title="Di chuyển đến vị trí file"
                                >
                                  <LocationOn fontSize="small" color="primary" />
                                </IconButton>

                                {/* Color picker */}
                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      p: 0.5,
                                      '&:hover + .color-picker-dropdown': {
                                        display: 'block'
                                      }
                                    }}
                                    title="Thay đổi màu"
                                  >
                                    <ColorLens fontSize="small" color="action" />
                                  </IconButton>
                                  <Box
                                    className="color-picker-dropdown"
                                    sx={{
                                      position: 'absolute',
                                      top: '100%',
                                      left: 0,
                                      display: 'none',
                                      backgroundColor: 'white',
                                      border: 1,
                                      borderColor: 'grey.300',
                                      borderRadius: 1,
                                      p: 0.5,
                                      boxShadow: 2,
                                      zIndex: 1000,
                                      '&:hover': {
                                        display: 'block'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
                                      {colorOptions.map((color) => (
                                        <Box
                                          key={color}
                                          sx={{
                                            width: 20,
                                            height: 20,
                                            backgroundColor: color,
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            border: file.color === color ? '2px solid black' : '1px solid grey',
                                            '&:hover': {
                                              transform: 'scale(1.1)'
                                            }
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleColorChange(file.id, color)
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Bạn có chắc chắn muốn xóa file "${file.name}"?`)) {
                                  removeFile(file.id)
                                }
                              }}
                              sx={{ p: 0.5 }}
                              title="Xóa file"
                            >
                              <Delete fontSize="small" color="error" />
                            </IconButton>
                          </Box>

                          {file.status === 'error' && file.error && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                              {file.error}
                            </Typography>
                          )}
                        </Box>
                      </ListItemButton>
                    )
                  })}
                </List>
              </Box>
            </>
          )}

          {kmlFiles.length === 0 && !isLoading && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              Chưa có file KML nào được import
            </Typography>
          )}
        </>
      )}
    </>
  )

  // Nếu là full panel mode
  if (isFullPanel) {
    return (
      <Card
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <CardHeader
          title="Quản lý Layers KML"
          avatar={<Layers color="primary" />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onRefresh && (
                <Tooltip title="Làm mới">
                  <IconButton
                    size="small"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Đóng">
                <IconButton
                  size="small"
                  onClick={onClose}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            pb: 1,
            bgcolor: 'grey.50'
          }}
        />

        <CardContent sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: 0 }
        }}>
          <Box sx={{ p: 2, flex: 1 }}>
            <PanelContent />
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Overlay mode
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 80, // Dời sang trái để tránh đè lên floating button
        bottom: 16,
        width: 400,
        maxWidth: 'calc(100vw - 112px)', // Điều chỉnh maxWidth cho phù hợp
        zIndex: 999, // Thấp hơn floating button một chút
        animation: 'slideInFromRight 0.3s ease-out',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card
        sx={{
          height: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          borderRadius: 4,
          overflow: 'hidden',
          border: '2px solid white',
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <CardHeader
          title="Quản lý Layers KML"
          avatar={<Layers color="primary" />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onRefresh && (
                <Tooltip title="Làm mới">
                  <IconButton
                    size="small"
                    onClick={onRefresh}
                    disabled={isLoading}
                    sx={{
                      '&:hover': {
                        transform: 'scale(1.1)',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Đóng">
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: 'error.light',
                      color: 'error.dark'
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            pb: 1,
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            '& .MuiCardHeader-title': {
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'primary.main'
            }
          }}
        />

        <CardContent sx={{ 
          flex: 1, 
          overflow: 'hidden',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: 0 }
        }}>
          <Box sx={{ p: 2, flex: 1, overflow: 'auto', minHeight: 0 }}>
            <PanelContent />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
})

LayerStatsPanel.displayName = 'LayerStatsPanel'
