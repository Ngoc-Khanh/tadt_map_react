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

// Hàm trả về mã màu hex theo trạng thái và tiến độ thực tế của zone
export const getZoneColor = (status: ETrangThaiType, tien_do_thuc_te: number) => {
  // Bảng màu sử dụng mã hex, dễ mở rộng và đồng bộ UI
  const colorPalette: Record<string, string> = {
    success: "#4caf50",    // Xanh lá
    primary: "#1976d2",    // Xanh dương
    info: "#0288d1",       // Xanh cyan
    warning: "#ff9800",    // Cam
    error: "#e74c3c",      // Đỏ
    default: "#bdbdbd",    // Xám nhạt
    inherit: "#757575"     // Xám đậm
  };

  if (status === ETrangThai.COMPLETED) return colorPalette.success;
  if (status === ETrangThai.PROCESSING) {
    if (tien_do_thuc_te >= 80) return colorPalette.success;
    if (tien_do_thuc_te >= 60) return colorPalette.primary;
    if (tien_do_thuc_te >= 40) return colorPalette.info;
    if (tien_do_thuc_te >= 20) return colorPalette.warning;
    return colorPalette.inherit;
  }
  if (status === ETrangThai.RETURNED) return colorPalette.error;
  if (status === ETrangThai.CREATED) return colorPalette.info;
  return colorPalette.default;
}