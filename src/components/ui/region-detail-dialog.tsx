import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  LocationOn, 
  Schedule, 
  Info, 
  Category,
  FormatShapes,
  Close
} from '@mui/icons-material';
import type { NamedRegion } from '@/stores/named-regions.atom';

interface RegionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  region: NamedRegion | null;
}

export function RegionDetailDialog({ 
  open, 
  onClose, 
  region 
}: RegionDetailDialogProps) {
  
  if (!region) return null;

  const getGeometryType = () => {
    if (!region.feature.geometry) return 'Không xác định';
    
    switch (region.feature.geometry.type) {
      case 'Point':
        return 'Điểm';
      case 'LineString':
        return 'Đường thẳng';
      case 'Polygon':
        return 'Đa giác';
      case 'MultiPolygon':
        return 'Đa giác phức hợp';
      case 'MultiLineString':
        return 'Đường thẳng phức hợp';
      case 'MultiPoint':
        return 'Nhiều điểm';
      default:
        return region.feature.geometry.type;
    }
  };

  const getCoordinatesInfo = () => {
    const geometry = region.feature.geometry;
    if (!geometry || !('coordinates' in geometry)) return null;
    
    const coords = geometry.coordinates as number[];
    if (geometry.type === 'Point') {
      return `${(coords[1] as number)?.toFixed(6)}, ${(coords[0] as number)?.toFixed(6)}`;
    }
    
    // For other geometry types, show first coordinate as sample
    const firstCoord = Array.isArray(coords[0]) ? coords[0][0] : coords[0];
    if (Array.isArray(firstCoord) && firstCoord.length >= 2) {
      return `${(firstCoord[1] as number)?.toFixed(6)}, ${(firstCoord[0] as number)?.toFixed(6)} (và nhiều điểm khác)`;
    }
    
    return 'Dữ liệu tọa độ phức tạp';
  };

  const properties = region.feature.properties || {};
  const propertyEntries = Object.entries(properties).filter(([, value]) => 
    value !== null && value !== undefined && value !== ''
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="error" />
            <Typography variant="h5" component="span" fontWeight="bold">
              {region.name}
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Thông tin cơ bản */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" />
              Thông tin cơ bản
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Schedule fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Thời gian tạo"
                  secondary={region.createdAt.toLocaleString('vi-VN')}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <FormatShapes fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Loại hình học"
                  secondary={getGeometryType()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocationOn fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Tọa độ"
                  secondary={getCoordinatesInfo()}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Thuộc tính */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category color="primary" />
              Thuộc tính ({propertyEntries.length})
            </Typography>
            
            {propertyEntries.length > 0 ? (
              <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {propertyEntries.map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Chip
                      label={`${key}: ${value}`}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 0.5, mr: 0.5 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có thuộc tính bổ sung
              </Typography>
            )}
          </Paper>

          {/* Màu sắc hiển thị */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hiển thị trên bản đồ
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 20, 
                  bgcolor: region.color, 
                  border: 1, 
                  borderColor: 'grey.300',
                  borderRadius: 1
                }} 
              />
              <Typography variant="body2">
                Màu hiển thị: <strong>{region.color}</strong>
              </Typography>
              <Chip 
                label="Vùng được đặt tên" 
                color="error" 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ minWidth: '120px' }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
