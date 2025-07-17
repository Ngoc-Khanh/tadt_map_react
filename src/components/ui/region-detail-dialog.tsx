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
  color?: string; // Add optional color prop
}

export function RegionDetailDialog({ 
  open, 
  onClose, 
  region,
  color = '#e74c3c' // Default color
}: RegionDetailDialogProps) {
  
  if (!region) return null;

  const getGeometryType = () => {
    if (!region.geometry || region.geometry.length === 0) return 'Không xác định';
    
    // Get the first geometry type as representative
    const firstGeom = region.geometry[0];
    if (!firstGeom) return 'Không xác định';
    
    switch (firstGeom.type) {
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
        return firstGeom.type;
    }
  };

  const getCoordinatesInfo = () => {
    if (!region.geometry || region.geometry.length === 0) return null;
    
    const firstGeom = region.geometry[0];
    if (!firstGeom || !firstGeom.coordinates || firstGeom.coordinates.length === 0) return null;
    
    // IGeometry has coordinates as [number, number, number][]
    const firstCoordSet = firstGeom.coordinates[0];
    if (!firstCoordSet || firstCoordSet.length < 2) return 'Dữ liệu tọa độ không hợp lệ';
    
    const [lon, lat] = firstCoordSet;
    return `${lat?.toFixed(6)}, ${lon?.toFixed(6)}${firstGeom.coordinates.length > 1 ? ' (và nhiều điểm khác)' : ''}`;
  };

  // Get properties from the first geometry
  const getProperties = () => {
    if (!region.geometry || region.geometry.length === 0) return {};
    const firstGeom = region.geometry[0];
    return firstGeom?.properties || {};
  };

  const properties = getProperties();
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
              {region.ten_block}
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
                  bgcolor: color, 
                  border: 1, 
                  borderColor: 'grey.300',
                  borderRadius: 1
                }} 
              />
              <Typography variant="body2">
                Màu hiển thị: <strong>{color}</strong>
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
