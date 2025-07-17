import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { Delete, Visibility, LocationOn, Info } from '@mui/icons-material';
import { useNamedRegions } from '@/hooks/useNamedRegions';
import type { NamedRegion } from '@/stores/named-regions.atom';

interface NamedRegionsPanelProps {
  onRegionClick?: (region: NamedRegion) => void;
  onRegionDetail?: (region: NamedRegion) => void;
}

export function NamedRegionsPanel({ onRegionClick, onRegionDetail }: NamedRegionsPanelProps) {
  const { namedRegions, removeNamedRegion } = useNamedRegions();

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
          Chưa có vùng nào được đặt tên
        </Typography>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Click vào vùng trên bản đồ và chọn "Đặt tên vùng này"
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ maxHeight: '400px', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          Các vùng đã đặt tên ({namedRegions.length})
        </Typography>
      </Box>
      
      <List sx={{ maxHeight: '320px', overflow: 'auto', p: 0 }}>
        {namedRegions.map((region, index) => (
          <Box key={region.id}>
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
                      {region.name}
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
                        label="Vùng được đặt tên"
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
                  <Tooltip title="Xóa vùng">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(region.id, e)}
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
