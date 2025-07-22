import { KMLLayer, LayerStatsPanel } from "@/components/pages/map.preivew";
import { routes } from "@/config";
import { useKMLData } from "@/hooks";
import { ArrowBack, CloudUpload, Layers } from "@mui/icons-material";
import { Box, Button, Chip, Paper, Tooltip, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";

export default function MapPreviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { kmlFiles } = useKMLData();
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const successfulFiles = kmlFiles.filter((f) => f.status === "success");

  const handleNavigateToLayer = (bounds: [[number, number], [number, number]]) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16
      });
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, gap: 2, p: 2 }}>
        {/* Main map area */}
        <Box sx={{ flex: 1, display: 'flex' }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số file được import: {kmlFiles.length}
                  </Typography>
                  <Chip
                    label={`${successfulFiles.length} thành công`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  {kmlFiles.filter((f) => f.status === "error").length > 0 && (
                    <Chip
                      label={`${kmlFiles.filter((f) => f.status === "error").length} lỗi`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {kmlFiles.filter((f) => f.status === "parsing").length > 0 && (
                    <Chip
                      label={`${kmlFiles.filter((f) => f.status === "parsing").length} đang xử lý`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={() => navigate(routes.projectDetail(projectId!))}
                sx={{
                  minWidth: '140px',
                  borderRadius: 2
                }}
              >
                Quay lại
              </Button>
            </Box>

            {/* Map Container */}
            <Box sx={{ flex: 1, position: 'relative' }}>
              {/* Floating Layer Management Button */}
              <Tooltip title="Quản lý hiển thị các layer" placement="left">
                <Button
                  onClick={() => setShowLayerPanel(!showLayerPanel)}
                  color="primary"
                  variant="contained"
                  size="small"
                  startIcon={<Layers />}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: 'primary.main',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      boxShadow: 4,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {showLayerPanel
                    ? `Đóng Panel`
                    : `Quản lý Layers (${kmlFiles.length} layer${kmlFiles.length !== 1 ? 's' : ''})`
                  }
                </Button>
              </Tooltip>

              {kmlFiles.length > 0 ? (
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
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={20}
                  />

                  {/* Render KML Layers - chỉ render khi layer được bật visible */}
                  {kmlFiles.map((file, index) => {
                    if (file.status === 'success' && file.visible && file.data && projectId) {
                      return (
                        <KMLLayer
                          projectId={projectId}
                          key={file.id}
                          data={file.data}
                          color={file.color}
                          fitBounds={index === 0} // Fit bounds only for the first layer
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Thông báo khi không có layer nào hiển thị */}
                  {kmlFiles.length > 0 &&
                    kmlFiles.filter((f) => f.status === "success" && f.visible).length === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 1000,
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                          p: 3,
                          borderRadius: 2,
                          boxShadow: 3,
                          textAlign: 'center',
                          border: '2px solid',
                          borderColor: 'warning.main'
                        }}
                      >
                        <Layers sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h6" color="warning.main" gutterBottom>
                          Tất cả layers đều đã bị ẩn
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sử dụng panel "Quản lý Layers" để bật hiển thị các layer
                        </Typography>
                      </Box>
                    )}
                </MapContainer>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: 'grey.50'
                  }}
                >
                  <CloudUpload sx={{ fontSize: 64, mb: 2, color: 'grey.300' }} />
                  <Typography variant="h6" gutterBottom>
                    Chưa có file KML nào được import
                  </Typography>
                  <Typography variant="body2" align="center">
                    Vui lòng quay lại trang trước để upload file KML/KMZ<br />
                    hoặc sử dụng panel bên trái để quản lý các layer đã có
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Layer Management Panel */}
          <div
            className={`transition-all duration-300 ease-out ${showLayerPanel ? 'w-96' : 'w-0'
              } flex-shrink-0 overflow-hidden`}
            style={{
              willChange: showLayerPanel ? 'auto' : 'transform', // Tối ưu GPU acceleration
            }}
          >
            {showLayerPanel && (
              <div className="h-full bg-white border-l border-gray-200 shadow-lg w-96">
                <LayerStatsPanel
                  open={showLayerPanel}
                  onClose={() => setShowLayerPanel(false)}
                  onRefresh={() => {
                    console.log('Refreshing layer stats...')
                  }}
                  onNavigateToLayer={handleNavigateToLayer}
                  isFullPanel={true}
                />
              </div>
            )}
          </div>
        </Box>
      </Box>
    </Box>
  );
}