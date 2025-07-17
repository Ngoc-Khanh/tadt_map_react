import type { IBlockWithGeometry, IZoneWithGeometry } from "@/data/interfaces";
import { Box, Fade, Popper, Typography, Divider } from "@mui/material";
import { ZoneAccordion } from "./zone-accordion";
import { NamedRegionsAccordion } from "./named-regions-accordion";
import type { NamedRegion } from "@/stores/named-regions.atom";

interface LayerPanelProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  zoneList?: IZoneWithGeometry[];
  blockList?: IBlockWithGeometry[];
  visibleZones: Set<string>;
  visibleBlocks: Set<string>;
  onToggleZoneVisibility: (zoneId: string) => void;
  onToggleBlockVisibility: (blockId: string) => void;
  onNavigateToGeometry: (geometry: { type: string; coordinates: unknown }[], isPackage?: boolean) => void;
  displayedNamedRegions?: NamedRegion[];
  visibleNamedRegions?: Set<string>;
  onToggleNamedRegionVisibility?: (regionId: string) => void;
}

export function LayerPanel({
  open,
  anchorEl,
  zoneList,
  blockList,
  visibleZones,
  visibleBlocks,
  onToggleZoneVisibility,
  onToggleBlockVisibility,
  onNavigateToGeometry,
  displayedNamedRegions,
  visibleNamedRegions,
  onToggleNamedRegionVisibility
}: LayerPanelProps) {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      className='z-[1001]'
      transition
      modifiers={[
        { name: 'offset', options: { offset: [0, 8] } },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
            padding: 16,
            altAxis: true,
            altBoundary: true
          }
        },
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start', 'bottom-end', 'top-end']
          }
        }
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Box sx={{
            bgcolor: 'background.paper',
            minWidth: 400,
            maxWidth: 'min(90vw, 500px)',
            maxHeight: 'min(80vh, 600px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box className='flex justify-between items-start'>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    Lớp bản đồ
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Quản lý các lớp bản đồ trên bản đồ
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{
              p: 2,
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 3 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'grey.600'
                }
              }
            }}>
              {/* Named Regions Accordion - hiển thị trong nội dung chính */}
              {displayedNamedRegions && displayedNamedRegions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <NamedRegionsAccordion
                    displayedNamedRegions={displayedNamedRegions}
                    visibleNamedRegions={visibleNamedRegions || new Set()}
                    onToggleNamedRegionVisibility={onToggleNamedRegionVisibility || (() => {})}
                    onNavigateToGeometry={onNavigateToGeometry}
                  />
                </Box>
              )}

              {/* Divider between Named Regions and Zone List */}
              {displayedNamedRegions && displayedNamedRegions.length > 0 && (
                <Divider sx={{ my: 2 }} />
              )}

              {/* Zone Accordion List */}
              {zoneList?.map((zone) => (
                <ZoneAccordion
                  key={zone.zone_id}
                  zone={zone}
                  blocks={blockList || []}
                  isZoneVisible={visibleZones.has(zone.zone_id)}
                  visibleBlocks={visibleBlocks}
                  onToggleZoneVisibility={onToggleZoneVisibility}
                  onToggleBlockVisibility={onToggleBlockVisibility}
                  onNavigateToGeometry={onNavigateToGeometry}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}
    </Popper>
  );
}
