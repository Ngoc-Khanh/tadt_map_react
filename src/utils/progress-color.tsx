import { ETrangThai, type ETrangThaiType } from "@/data/enums";
import { Create, Done, HelpOutline, HourglassEmpty, PendingActions, Settings, Stop, Undo, Verified, Visibility } from '@mui/icons-material';

export const getStatusIcon = (status: ETrangThaiType) => {
  const iconProps = { fontSize: "small" as const };

  switch (status) {
    case ETrangThai.CREATED: return <Create {...iconProps} />;
    case ETrangThai.PROCESSING_APPROVAL: return <PendingActions {...iconProps} />;
    case ETrangThai.WAITING_PROCESSING: return <HourglassEmpty {...iconProps} />;
    case ETrangThai.PROCESSING: return <Settings {...iconProps} />;
    case ETrangThai.CONFIRMED: return <Verified {...iconProps} />;
    case ETrangThai.COMPLETION_APPROVAL: return <Visibility {...iconProps} />;
    case ETrangThai.COMPLETED: return <Done {...iconProps} />;
    case ETrangThai.RETURNED: return <Undo {...iconProps} />;
    case ETrangThai.CLOSED: return <Stop {...iconProps} />;
    default: return <HelpOutline {...iconProps} />;
  }
};

export const getStatusProjectColor = (status: ETrangThaiType) => {
  switch (status) {
    case ETrangThai.CREATED: return 'primary';
    case ETrangThai.COMPLETED: return 'success';
    case ETrangThai.PROCESSING: return 'warning';
    case ETrangThai.PROCESSING_APPROVAL: return 'info';
    default: return 'default';
  }
}

export const getProgressProjectColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 60) return 'primary';
  if (progress >= 40) return 'info';
  if (progress >= 20) return 'warning';
  return 'inherit';
}