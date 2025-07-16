import { Box, CircularProgress, Stack, Typography } from "@mui/material"

interface LoadingProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

export const Loading = ({ 
  message = "Đang tải...", 
  size = 40,
  fullHeight = false 
}: LoadingProps) => {
  return (
    <Box
      sx={{
        minHeight: fullHeight ? "100vh" : "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={size} />
        <Typography color="text.secondary" variant="body2">
          {message}
        </Typography>
      </Stack>
    </Box>
  )
}
