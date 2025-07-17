import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Switch,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import { ExpandMore, Visibility, LocationOn } from '@mui/icons-material';
import type { NamedRegion } from "@/stores/named-regions.atom";

interface NamedRegionsAccordionProps {
  displayedNamedRegions: NamedRegion[];
  visibleNamedRegions: Set<string>;
  onToggleNamedRegionVisibility: (regionId: string) => void;
  onNavigateToGeometry?: (geometry: { type: string; coordinates: unknown }[], isPackage?: boolean) => void;
}

export function NamedRegionsAccordion({
  displayedNamedRegions,
  visibleNamedRegions,
  onToggleNamedRegionVisibility,
  onNavigateToGeometry
}: NamedRegionsAccordionProps) {
  const visibleCount = displayedNamedRegions.filter(region => 
    visibleNamedRegions.has(region.block_id)
  ).length;

  const handleNavigateToRegion = (region: NamedRegion) => {
    if (onNavigateToGeometry && region.geometry && region.geometry.length > 0) {
      // Sử dụng geometry từ NamedRegion (đã có format chuẩn)
      const geometry = region.geometry.map(geom => ({
        type: geom.type,
        coordinates: geom.coordinates
      }));
      onNavigateToGeometry(geometry, true);
    }
  };

  if (displayedNamedRegions.length === 0) {
    return null;
  }

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: '0 0 16px 0'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'error.50',
          borderRadius: '8px 8px 0 0',
          minHeight: 56,
          '&.Mui-expanded': {
            borderRadius: '8px 8px 0 0',
            minHeight: 56
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: 'error.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
              Block đã đặt tên
            </Typography>
            <Chip
              size="small"
              label={`${visibleCount}/${displayedNamedRegions.length}`}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <List dense sx={{ py: 0 }}>
          {displayedNamedRegions.map((region) => {
            const isVisible = visibleNamedRegions.has(region.block_id);
            
            return (
              <ListItem
                key={region.block_id}
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Switch
                  size="small"
                  checked={isVisible}
                  onChange={() => onToggleNamedRegionVisibility(region.block_id)}
                  sx={{ mr: 1 }}
                />
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {region.ten_block}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Tạo: {region.createdAt.toLocaleDateString('vi-VN')}
                    </Typography>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Tooltip title="Xem trên bản đồ">
                    <IconButton
                      size="small"
                      onClick={() => handleNavigateToRegion(region)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}
