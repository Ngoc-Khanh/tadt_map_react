import type { IBlockPlanningArea } from "@/data/interfaces";
import { getZoneColor } from "@/lib/progress-color";
import { Box, Button, Divider, LinearProgress, Popover, Typography } from "@mui/material";

interface IMainMapPopoverProps {
  popupAnchor: { mouseX: number; mouseY: number } | null;
  setPopupAnchor: (anchor: { mouseX: number; mouseY: number } | null) => void;
  popupBlock: IBlockPlanningArea | null;
  setSelectedBlock: (block: IBlockPlanningArea | null) => void;
}

export function MainMapPopover({ popupAnchor, setPopupAnchor, popupBlock, setSelectedBlock }: IMainMapPopoverProps) {
  return (
    <Popover
      open={!!popupAnchor}
      anchorReference="anchorPosition"
      anchorPosition={
        popupAnchor
          ? { top: popupAnchor.mouseY, left: popupAnchor.mouseX }
          : undefined
      }
      onClose={() => setPopupAnchor(null)}
      PaperProps={{ sx: { p: 2, minWidth: 220 } }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Tên Block: {popupBlock?.block_name}
      </Typography>
      {popupBlock?.block_id ? (
        <Typography variant="body2" color="text.secondary">
          Mã block: {popupBlock?.block_id}
        </Typography>
      ) : (
        <Box sx={{
          p: 1.5,
          bgcolor: 'warning.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.200',
          mt: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="warning.dark" fontWeight={500}>
            Chưa gắn mã block
          </Typography>
        </Box>
      )}
      {typeof popupBlock?.tien_do_thuc_te === 'number' && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Tiến độ:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={popupBlock.tien_do_thuc_te}
            sx={{
              height: 8,
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te),
              }
            }}
          />
          <Typography variant="caption" sx={{ color: getZoneColor(popupBlock.trang_thai, popupBlock.tien_do_thuc_te) }}>
            {popupBlock.tien_do_thuc_te}%
          </Typography>
        </Box>
      )}
      {popupBlock?.block_id && (
        <>
          <Divider sx={{ my: 1 }} />
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setSelectedBlock(popupBlock);
              setPopupAnchor(null);
            }}
            fullWidth
          >
            Xem chi tiết
          </Button>
        </>
      )}
    </Popover>
  )
}