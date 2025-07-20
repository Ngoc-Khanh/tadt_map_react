import { Alert, Box, Container, Typography } from "@mui/material";

interface ProjectErrorProps {
  error: Error;
}

export const ProjectError = ({ error }: ProjectErrorProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Alert
          severity="error"
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Có lỗi xảy ra
          </Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
      </Container>
    </Box>
  )
}