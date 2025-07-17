import { CloudUpload, ArrowBack } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import { MapContainer, TileLayer } from 'react-leaflet';
import { useKMLData } from "@/hooks/useKMLAtom";
import { useNamedRegions } from "@/hooks/useNamedRegions";
import { KMLLayer } from "@/components/map/KMLLayer";
import { NamedRegionLayer } from "@/components/map/NamedRegionLayer";
import { NameRegionDialog } from "@/components/ui/name-region-dialog";
import { NamedRegionsPanel } from "@/components/ui/named-regions-panel";
import { RegionDetailDialog } from "@/components/ui/region-detail-dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Feature } from "geojson";
import type { NamedRegion } from "@/stores/named-regions.atom";

export function MapPreview() {
  const navigate = useNavigate();
  const { kmlFiles, getVisibleKMLData } = useKMLData();
  const { namedRegions, addNamedRegion } = useNamedRegions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<NamedRegion | null>(null);
  
  const visibleKMLData = getVisibleKMLData();
  const successfulFiles = kmlFiles.filter(f => f.status === 'success');

  const handleBack = () => {
    navigate(-1);
  };

  const handleNameRegion = (feature: Feature) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };

  const handleSaveRegionName = (name: string) => {
    if (selectedFeature) {
      addNamedRegion(name, selectedFeature);
      setSelectedFeature(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFeature(null);
  };

  const handleRegionClick = (region: NamedRegion) => {
    setSelectedRegion(region);
    setDetailDialogOpen(true);
  };

  const handleRegionDetail = (region: NamedRegion) => {
    setSelectedRegion(region);
    setDetailDialogOpen(true);
  };

  const handleDetailDialogClose = () => {
    setDetailDialogOpen(false);
    setSelectedRegion(null);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, gap: 2, p: 2 }}>
        {/* Left sidebar with named regions */}
        <Box sx={{ width: '320px', flexShrink: 0 }}>
          <NamedRegionsPanel 
            onRegionClick={handleRegionClick}
            onRegionDetail={handleRegionDetail}
          />
        </Box>

        {/* Main map area */}
        <Paper
          elevation={2}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              bgcolor: 'background.paper'
            }}
          >
            <Box>
              <Typography variant="h5" color="primary" fontWeight="bold">
                Preview Bản đồ KML
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {successfulFiles.length} file KML đã được tải lên thành công
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                ml: 2,
                minWidth: '140px',
                borderRadius: 2
              }}
            >
              Quay lại
            </Button>
          </Box>

          {/* Map Container */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            {visibleKMLData.length > 0 ? (
              <MapContainer
                center={[21.0285, 105.8542]}
                zoom={10}
                style={{
                  height: '100%',
                  width: '100%'
                }}
                zoomControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  subdomains="abcd"
                  maxZoom={20}
                />

                {/* Render KML Layers */}
                {kmlFiles.map((file, index) => {
                  if (file.status === 'success' && file.visible && file.data) {
                    return (
                      <KMLLayer
                        key={file.id}
                        data={file.data}
                        color={file.color}
                        fitBounds={index === 0} // Fit bounds only for the first layer
                        onNameRegion={handleNameRegion}
                      />
                    );
                  }
                  return null;
                })}

                {/* Render Named Region Layers */}
                {namedRegions.map((region) => (
                  <NamedRegionLayer
                    key={region.id}
                    namedRegion={region}
                  />
                ))}
              </MapContainer>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary'
                }}
              >
                <CloudUpload sx={{ fontSize: 64, mb: 2, color: 'grey.300' }} />
                <Typography variant="h6" gutterBottom>
                  Chưa có dữ liệu KML nào để hiển thị
                </Typography>
                <Typography variant="body2">
                  Vui lòng upload file KML/KMZ trước khi xem preview
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Name Region Dialog */}
      <NameRegionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        feature={selectedFeature}
        onSave={handleSaveRegionName}
      />

      {/* Region Detail Dialog */}
      <RegionDetailDialog
        open={detailDialogOpen}
        onClose={handleDetailDialogClose}
        region={selectedRegion}
      />
    </Box>
  );
}