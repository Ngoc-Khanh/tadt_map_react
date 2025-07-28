import { routes } from "@/config";
import type { IProject } from "@/data/interfaces";
import { formatDate } from "@/lib/format-date";
import { getProgressProjectColor, getStatusIcon, getStatusProjectColor } from "@/lib/progress-color";
import { Visibility } from "@mui/icons-material";
import { Box, Button, Card, CardActions, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const ProjectCard = ({ project }: { project: IProject }) => {
  const statusIcon = getStatusIcon(project.trang_thai);
  const statusColor = getStatusProjectColor(project.trang_thai);
  const progressColor = getProgressProjectColor(project.tien_do_thuc_te);

  return (
    <Card
      sx={{
        width: '100%',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Tiến độ thực tế:
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

        {/* Dates Section - Compact Grid Layout */}
        <Stack spacing={1.5}>
          {/* Start and End Date */}
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                Ngày bắt đầu kế hoạch:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatDate(project.ngay_bd_ke_hoach)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: 'flex-end' }}>
                Ngày kết thúc kế hoạch:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="error.main">
                {formatDate(project.ngay_kt_ke_hoach)}
              </Typography>
            </Box>
          </Stack>

          {/* Update Date */}
          <Box sx={{
            p: 1.5,
            backgroundColor: 'grey.50',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'grey.200',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Cập nhật gần nhất
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {formatDate(project.ngay_cap_nhat)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0 }}>
        <Link to={routes.projectDetail(project.project_id)} style={{ textDecoration: 'none', width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Visibility />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              fontSize: '0.875rem',
            }}
          >
            Xem chi tiết
          </Button>
        </Link>
      </CardActions>
    </Card>
  )
}