export const ETrangThai = {
  CREATED: "Mới tạo", 
  PROCESSING_APPROVAL: "Chờ duyệt thực hiện",
  WAITING_PROCESSING: "Chờ thực hiện",
  PROCESSING: "Đang thực hiện",
  CONFIRMED: "Đã xác nhận",
  COMPLETION_APPROVAL: "Chờ duyệt hoàn thành",
  COMPLETED: "Hoàn thành",
  RETURNED: "Trả lại",
  CLOSED: "Tạm dừng",
} as const;

export type ETrangThaiType = typeof ETrangThai[keyof typeof ETrangThai];
