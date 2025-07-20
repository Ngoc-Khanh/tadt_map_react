export const formatDate = (dateString: string) => {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '--' : d.toLocaleDateString('vi-VN');
};