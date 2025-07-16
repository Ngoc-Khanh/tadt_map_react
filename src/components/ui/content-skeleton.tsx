import { Skeleton, Stack, Card, CardContent, Box } from "@mui/material";

interface ContentSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  height?: number;
}

export const ContentSkeleton = ({ 
  lines = 3, 
  showAvatar = false, 
  height = 200 
}: ContentSkeletonProps) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {showAvatar && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="30%" height={20} />
            </Box>
          )}
          
          <Skeleton variant="rectangular" width="100%" height={height} />
          
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              variant="text" 
              width={index === lines - 1 ? "60%" : "100%"} 
              height={20}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
