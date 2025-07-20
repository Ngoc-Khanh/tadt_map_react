import { ProjectCard, ProjectError, ProjectLoading } from "@/components/pages/project";
import { useProjectsList } from "@/hooks";
import { Box, Container, Typography } from "@mui/material";

export default function ProjectPage() {
  const { data: projects, isLoading, error } = useProjectsList();

  if (isLoading) return <ProjectLoading />;
  if (error) return <ProjectError error={error as Error} />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden'
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          width: '100%',
          py: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {projects && projects.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, md: 3 },
              alignItems: 'stretch',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              pb: 4,
            }}
          >
            {projects.map((project) => (
              <Box
                key={project.project_id}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 300px' },
                  maxWidth: { xs: 400, sm: '48%', md: '31%', lg: '23%' },
                  minWidth: { xs: 280, sm: 300 },
                  display: 'flex',
                }}
              >
                <ProjectCard project={project} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minHeight: '50vh',
              textAlign: 'center',
              px: 2
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3rem", md: "4rem" },
                mb: 2,
                opacity: 0.6
              }}
            >
              📁
            </Typography>
            <Typography
              variant="h5"
              fontWeight="600"
              gutterBottom
              sx={{ mb: 1 }}
            >
              Chưa có dự án
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 400 }}
            >
              Hiện tại chưa có dự án nào trong hệ thống. Hãy tạo dự án đầu tiên của bạn!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}