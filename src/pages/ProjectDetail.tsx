import { ProjectImporting, ProjectMainMap } from "@/components/pages/project.detail";
import { ErrorDisplay, Loading } from "@/components/ui";
import { routes } from "@/config";
import { useImportState } from "@/hooks/useImportState";
import { useBlocksInProject, useProjectsDetail, useZonesInProject } from "@/hooks/useProjects";
import { KeyboardArrowLeft, Layers, Refresh } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>()
  const { isImporting, openImport } = useImportState();
  const { data: projectDetail, isLoading: isLoadingProject, error: errorProject, refetch: refetchProject } = useProjectsDetail(projectId!);
  const { isLoading: isLoadingZone, error: errorZone, refetch: refetchZones } = useZonesInProject(projectId!);
  const { isLoading: isLoadingProjectList, error: errorProjectList, refetch: refetchBlocks } = useBlocksInProject(projectId!);

  if (isLoadingProject || isLoadingZone || isLoadingProjectList) return <Loading message="Đang tải thông tin dự án..." size={60} fullHeight={true} />;
  if (errorProject) return <ErrorDisplay error={errorProject} title="Lỗi tải thông tin dự án" onRetry={refetchProject} fullHeight={true} />;
  if (errorZone) return <ErrorDisplay error={errorZone} title="Lỗi tải thông tin khu vực" onRetry={refetchZones} fullHeight={true} />;
  if (errorProjectList) return <ErrorDisplay error={errorProjectList} title="Lỗi tải danh sách block" onRetry={refetchBlocks} fullHeight={true} />;

  const handleRefresh = () => {
    refetchProject();
    refetchZones();
    refetchBlocks();
  };

  if (isImporting) return <ProjectImporting projectId={projectId!} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Enhanced Header */}
      <Paper elevation={2} className="bg-white border-b border-gray-200" sx={{ flexShrink: 0 }}>
        <Box className="px-6 py-4">
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
              <Typography variant="h4" className="font-bold text-gray-800">
                {projectDetail?.ten_du_an}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
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
            <ProjectMainMap projectId={projectId!} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}