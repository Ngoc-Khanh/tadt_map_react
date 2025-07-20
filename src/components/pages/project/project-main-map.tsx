import { LayerToggleButton } from "@/components/pages/project/layer-button";
import type { IPlanningArea } from "@/data/interfaces";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Fade, Popper, Tooltip, Typography } from "@mui/material";
import { Map as LeafletMapType } from "leaflet";
import { useRef, useState } from "react";
import { TbEye, TbEyeOff, TbZoomScan } from "react-icons/tb";
import { MapContainer, TileLayer } from "react-leaflet";

interface IProjectMainMapProps {
  planningAreaList?: IPlanningArea;
}

export function ProjectMainMap({ planningAreaList }: IProjectMainMapProps) {
  const mapRef = useRef<LeafletMapType | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleZones] = useState<Set<string>>(new Set());

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Box className="absolute top-2 left-2 z-[1000]">
        <LayerToggleButton
          planningAreaList={planningAreaList}
          open={open}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
        />
      </Box>

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
                {/* Zone Accordion List */}
                {planningAreaList?.zones.map((zone) => (
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
                                color: visibleZones.has(zone.zone_id) ? 'primary.dark' : 'grey.600',
                                background: 'transparent',
                                boxShadow: 'none',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2,
                                  borderColor: visibleZones.has(zone.zone_id) ? 'primary.dark' : 'grey.500',
                                  background: 'transparent'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                // onToggleZoneVisibility(zone.zone_id)
                              }}
                            >
                              {visibleZones.has(zone.zone_id) ? (
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
                                // onNavigateToGeometry(zone.geometry || [], false)
                              }}
                            >
                              <TbZoomScan className='w-4 h-4' />
                            </Button>
                          </Tooltip>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0 }}>
                      {zone.blocks.length > 0 ? zone.blocks.map((block) => (
                        <Box sx={{ pl: 2, pr: 1 }} key={block.block_id}>
                          <Typography variant="body2">{block.ten_block}</Typography>
                        </Box>
                      )) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Không có block nào trong vùng này
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>

            </Box>
          </Fade>
        )}
      </Popper>

      <MapContainer
        ref={mapRef}
        center={[21.0285, 105.8542]}
        zoom={10}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        preferCanvas={true}
        attributionControl={true}
        worldCopyJump={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

      </MapContainer>
    </Box>
  )
}