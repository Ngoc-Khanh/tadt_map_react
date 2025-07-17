import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import type { Feature } from 'geojson';

interface NameRegionDialogProps {
  open: boolean;
  onClose: () => void;
  feature: Feature | null;
  onSave: (name: string) => void;
}

export function NameRegionDialog({ 
  open, 
  onClose, 
  feature, 
  onSave 
}: NameRegionDialogProps) {
  const [regionName, setRegionName] = useState('');

  const handleSave = () => {
    if (regionName.trim()) {
      onSave(regionName.trim());
      setRegionName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setRegionName('');
    onClose();
  };

  const getFeatureInfo = () => {
    if (!feature?.properties) return null;
    
    return Object.entries(feature.properties)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .slice(0, 3); // Show only first 3 properties
  };

  const featureInfo = getFeatureInfo();

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '300px'  
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="error" />
          <Typography variant="h6" component="span">
            Đặt tên block đã chọn
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Block này sẽ được tô màu đỏ và lưu với tên bạn đặt
          </Typography>
          
          {featureInfo && featureInfo.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Thông tin block:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {featureInfo.map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <TextField
          autoFocus
          fullWidth
          label="Tên block"
          placeholder="Nhập tên cho block này..."
          value={regionName}
          onChange={(e) => setRegionName(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && regionName.trim()) {
              handleSave();
            }
          }}
        />
        
        <Typography variant="caption" color="text.secondary">
          * Block được đặt tên sẽ được highlight màu đỏ trên bản đồ
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          sx={{ minWidth: '100px' }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          color="error"
          disabled={!regionName.trim()}
          sx={{ minWidth: '100px' }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
