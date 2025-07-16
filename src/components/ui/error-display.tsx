import { 
  Alert, 
  Box, 
  Button, 
  Container, 
  Typography, 
  useTheme 
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  fullHeight?: boolean;
}

export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  title = "Có lỗi xảy ra",
  fullHeight = false 
}: ErrorDisplayProps) => {
  const theme = useTheme();
  const errorMessage = typeof error === 'string' ? error : error.message;
  
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
      <Container maxWidth="sm">
        <Alert
          severity="error"
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ mb: onRetry ? 2 : 0 }}>
            {errorMessage}
          </Typography>
          {onRetry && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={onRetry}
              size="small"
            >
              Thử lại
            </Button>
          )}
        </Alert>
      </Container>
    </Box>
  )
}
