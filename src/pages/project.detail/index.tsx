import { ProjectMainMap } from "@/components/pages/project";
import { ProjectImporting } from "@/components/pages/project.detail";
import { routes } from "@/config";
import { usePlanningAreaList } from "@/hooks";
import { useImportState } from "@/hooks/useImportState";
import { KeyboardArrowLeft, Layers, Refresh } from "@mui/icons-material";
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: planningAreaList, isLoading: isLoadingPlanningArea, refetch: refetchPlanningArea } = usePlanningAreaList(projectId!);
  const { isImporting, openImport } = useImportState();

  if (isImporting) return <ProjectImporting projectId={projectId!} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Enhanced Header */}
      <Paper elevation={2} className="bg-white border-b border-gray-200" sx={{ flexShrink: 0 }}>
        <Box className="px-6 py-2">
          {/* Header Top Row */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => navigate(routes.projects)}
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <Typography variant="h5" className="font-bold text-gray-800">
                {planningAreaList?.ten_du_an}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => refetchPlanningArea()}
                size="small"
                sx={{
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Làm mới
              </Button>
              <Tooltip title="Import dữ liệu vào bản đồ chính">
                <Button
                  startIcon={<Layers />}
                  variant="outlined"
                  size="small"
                  sx={{
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                  onClick={openImport}
                >
                  Thêm dữ liệu vào bản đồ
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Content Area */}
      <Box sx={{ flex: 1, p: 1, minHeight: 0 }}>
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            <ProjectMainMap planningAreaList={planningAreaList} isLoading={isLoadingPlanningArea} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}