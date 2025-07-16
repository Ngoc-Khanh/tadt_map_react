import { routes } from "@/config";
import type { IProject } from "@/data/interfaces";
import { formatDate } from "@/utils/format-date";
import { getProgressProjectColor, getStatusIcon, getStatusProjectColor } from "@/utils/progress-color";
import { Visibility } from "@mui/icons-material";
import { Box, Button, Card, CardActions, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function ProjectCard({ project }: { project: IProject }) {
  const statusIcon = getStatusIcon(project.trang_thai);
  const statusColor = getStatusProjectColor(project.trang_thai);
  const progressColor = getProgressProjectColor(project.tien_do_thuc_te);

  return (
    <Card
      sx={{
        width: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.2em',
              flex: 1,
              mr: 2,
            }}
          >
            {project.ten_du_an}
          </Typography>
          <Chip
            icon={statusIcon}
            label={project.trang_thai}
            color={statusColor}
            size="small"
            sx={{
              borderRadius: 2,
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Tiến độ thực tế
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {project.tien_do_thuc_te}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, project.tien_do_thuc_te))}
            color={progressColor}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }}
          />
        </Box>

        {/* Update Date */}
        <Box sx={{
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Cập nhật:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {formatDate(project.ngay_cap_nhat)}
            </Typography>
          </Stack>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Link to={routes.projectDetail(project.project_id)} style={{ textDecoration: 'none', width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Visibility />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.2,
              fontSize: '0.875rem',
            }}
          >
            Xem chi tiết
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}
