import { routes } from '@/config/routes';
import { useImportState } from '@/hooks/useImportState';
import { useNamedRegions } from '@/hooks/useNamedRegions';
import type { NamedRegion } from '@/stores/named-regions.atom';
import { Delete, Info, LocationOn, Map, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NamedRegionsPanelProps {
  onRegionClick?: (region: NamedRegion) => void;
  onRegionDetail?: (region: NamedRegion) => void;
  projectId?: string;
  onAddToMainMap?: () => void;
}

export function NamedRegionsPanel({ onRegionClick, onRegionDetail, projectId, onAddToMainMap }: NamedRegionsPanelProps) {
  const { namedRegions, removeNamedRegion } = useNamedRegions();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { closeImport } = useImportState();

  // Debug log để kiểm tra
  console.log('NamedRegionsPanel Debug:', {
    projectId,
    namedRegionsCount: namedRegions.length,
    namedRegions
  });

  const handleDelete = (regionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeNamedRegion(regionId);
  };

  const handleRegionClick = (region: NamedRegion) => {
    if (onRegionClick) {
      onRegionClick(region);
    }
  };

  const handleDetailClick = (region: NamedRegion, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onRegionDetail) {
      onRegionDetail(region);
    }
  };

  const handleAddToMainMap = async () => {
    if (!projectId || namedRegions.length === 0) return;

    try {
      // If onAddToMainMap callback is provided (for ProjectDetail), use it
      if (onAddToMainMap) {
        onAddToMainMap();
        setSuccessMessage(`Đã thêm ${namedRegions.length} block vào bản đồ chính thành công!`);
        
        // Auto-navigate to ProjectDetail page after 1.5 seconds
        setTimeout(() => {
          navigate(routes.projectDetail(projectId));
          closeImport(); // Close import state if applicable
        }, 1500);
      } else {
        // For other components that might need API calls, add logic here
        setSuccessMessage(`Đã thêm ${namedRegions.length} block vào bản đồ chính thành công!`);
        
        // Auto-navigate to ProjectDetail page after 1.5 seconds
        setTimeout(() => {
          navigate(routes.projectDetail(projectId));
          closeImport(); // Close import state if applicable
        }, 1500);
      }
      
    } catch (error) {
      console.error('Failed to add blocks to main map:', error);
    }
  };

  if (namedRegions.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: 'grey.50'
        }}
      >
        <LocationOn sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Chưa có block nào được đặt tên
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Click vào block trên bản đồ và chọn "Đặt tên block này"
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ maxHeight: '400px', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Các block đã đặt tên ({namedRegions.length})
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Map />}
            onClick={handleAddToMainMap}
            disabled={!projectId || namedRegions.length === 0}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 2
            }}
          >
            {!projectId 
              ? 'Không có Project ID' 
              : namedRegions.length === 0 
                ? 'Chưa có block nào' 
                : 'Thêm vào bản đồ chính'
            }
          </Button>
        </Box>
      </Box>
      
      {successMessage && (
        <Alert severity="success" sx={{ m: 2, mb: 0 }}>
          {successMessage}
        </Alert>
      )}
      
      <List sx={{ maxHeight: '280px', overflow: 'auto', p: 0 }}>
        {namedRegions.map((region, index) => (
          <Box key={region.block_id}>
            <ListItem
              onClick={() => handleRegionClick(region)}
              sx={{
                py: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="error" sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      {region.ten_block}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {region.createdAt.toLocaleString('vi-VN')}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label="Block được đặt tên"
                        sx={{
                          bgcolor: 'error.light',
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDetailClick(region, e)}
                      sx={{ color: 'info.main' }}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xem trên bản đồ">
                    <IconButton
                      size="small"
                      onClick={() => handleRegionClick(region)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa block">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(region.block_id, e)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
            {index < namedRegions.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}
