import { Alert, AlertTitle, Box } from "@mui/material";
import { Info, Warning, Error as ErrorIcon, CheckCircle } from "@mui/icons-material";

type NotificationVariant = 'info' | 'warning' | 'error' | 'success';

interface NotificationProps {
  variant: NotificationVariant;
  title?: string;
  message: string;
  action?: React.ReactNode;
  showIcon?: boolean;
}

const variantConfig = {
  info: { icon: Info, severity: 'info' as const },
  warning: { icon: Warning, severity: 'warning' as const },
  error: { icon: ErrorIcon, severity: 'error' as const },
  success: { icon: CheckCircle, severity: 'success' as const },
};

export const Notification = ({ 
  variant, 
  title, 
  message, 
  action,
  showIcon = true 
}: NotificationProps) => {
  const { icon: IconComponent, severity } = variantConfig[variant];

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity={severity}
        icon={showIcon ? <IconComponent /> : false}
        action={action}
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};
