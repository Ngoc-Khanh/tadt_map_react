import { useState } from 'react';
import { 
  Box, 
  Button, 
  Stack, 
  Typography, 
  Container,
  Paper
} from '@mui/material';
import { 
  Loading, 
  ErrorDisplay, 
  ContentSkeleton, 
  Notification 
} from '@/components/ui';

type DemoState = 'idle' | 'loading' | 'error' | 'success' | 'skeleton';

export const ComponentDemo = () => {
  const [state, setState] = useState<DemoState>('idle');
  
  const handleStateChange = (newState: DemoState) => {
    setState(newState);
  };
  
  const handleRetry = () => {
    setState('loading');
    setTimeout(() => setState('success'), 2000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        UI Components Demo
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Controls
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button 
            variant={state === 'loading' ? 'contained' : 'outlined'}
            onClick={() => handleStateChange('loading')}
          >
            Loading
          </Button>
          <Button 
            variant={state === 'error' ? 'contained' : 'outlined'}
            onClick={() => handleStateChange('error')}
          >
            Error
          </Button>
          <Button 
            variant={state === 'skeleton' ? 'contained' : 'outlined'}
            onClick={() => handleStateChange('skeleton')}
          >
            Skeleton
          </Button>
          <Button 
            variant={state === 'success' ? 'contained' : 'outlined'}
            onClick={() => handleStateChange('success')}
          >
            Success
          </Button>
          <Button 
            variant={state === 'idle' ? 'contained' : 'outlined'}
            onClick={() => handleStateChange('idle')}
          >
            Reset
          </Button>
        </Stack>
      </Paper>
      
      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="h6" gutterBottom>
          Component Display
        </Typography>
        
        {state === 'loading' && (
          <Loading 
            message="Đang tải dữ liệu demo..." 
            size={50}
          />
        )}
        
        {state === 'error' && (
          <ErrorDisplay 
            error={new Error("Đây là một lỗi demo để kiểm tra component")}
            title="Lỗi Demo"
            onRetry={handleRetry}
          />
        )}
        
        {state === 'skeleton' && (
          <Stack spacing={2}>
            <ContentSkeleton lines={2} showAvatar={true} height={100} />
            <ContentSkeleton lines={3} height={150} />
            <ContentSkeleton lines={1} height={80} />
          </Stack>
        )}
        
        {state === 'success' && (
          <Stack spacing={2}>
            <Notification 
              variant="success"
              title="Thành công!"
              message="Dữ liệu đã được tải thành công."
            />
            <Notification 
              variant="info"
              message="Đây là thông tin bổ sung."
            />
            <Notification 
              variant="warning"
              title="Cảnh báo"
              message="Hãy kiểm tra kỹ trước khi tiếp tục."
            />
          </Stack>
        )}
        
        {state === 'idle' && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Chọn một component để xem demo
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
