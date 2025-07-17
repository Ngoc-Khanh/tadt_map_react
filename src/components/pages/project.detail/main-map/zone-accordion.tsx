import type { IBlockWithGeometry, IZoneWithGeometry } from "@/data/interfaces";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Tooltip, Typography } from "@mui/material";
import { TbEye, TbEyeOff, TbZoomScan } from 'react-icons/tb';
import { BlockItem } from "./block-item";

interface ZoneAccordionProps {
  zone: IZoneWithGeometry;
  blocks: IBlockWithGeometry[];
  isZoneVisible: boolean;
  visibleBlocks: Set<string>;
  onToggleZoneVisibility: (zoneId: string) => void;
  onToggleBlockVisibility: (blockId: string) => void;
  onNavigateToGeometry: (geometry: { type: string; coordinates: unknown }[], isPackage?: boolean) => void;
}

export function ZoneAccordion({
  zone,
  blocks,
  isZoneVisible,
  visibleBlocks,
  onToggleZoneVisibility,
  onToggleBlockVisibility,
  onNavigateToGeometry
}: ZoneAccordionProps) {
  const blocksInZone = blocks.filter(block => block.zone_id === zone.zone_id);

  return (
    <Accordion key={zone.zone_id}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{zone.ten_phan_khu}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, paddingRight: 1 }}>
            <Tooltip title="Hiển thị/Ẩn vùng">
              <Button
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0.5,
                  borderRadius: '50%',
                  color: isZoneVisible ? 'primary.dark' : 'grey.600',
                  background: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 2,
                    borderColor: isZoneVisible ? 'primary.dark' : 'grey.500',
                    background: 'transparent'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleZoneVisibility(zone.zone_id)
                }}
              >
                {isZoneVisible ? (
                  <TbEye className='w-4 h-4' />
                ) : (
                  <TbEyeOff className='w-4 h-4' />
                )}
              </Button>
            </Tooltip>
            <Tooltip title="Zoom đến vùng">
              <Button
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0.5,
                  borderRadius: '50%',
                  background: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: 2,
                    borderColor: 'primary.dark',
                    background: 'transparent'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigateToGeometry(zone.geometry || [], false)
                }}
              >
                <TbZoomScan className='w-4 h-4' />
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {blocksInZone.length > 0 ? (
          <Box sx={{ pl: 2, pr: 1 }}>
            {blocksInZone.map((block) => (
              <BlockItem
                key={block.block_id}
                block={block}
                isVisible={visibleBlocks.has(block.block_id)}
                onToggleVisibility={onToggleBlockVisibility}
                onNavigateToGeometry={onNavigateToGeometry}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Không có block nào trong vùng này
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
