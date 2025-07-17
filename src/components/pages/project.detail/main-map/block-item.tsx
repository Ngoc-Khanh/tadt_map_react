import { Box, Button, Tooltip, Typography } from "@mui/material";
import { TbEye, TbEyeOff, TbZoomScan } from 'react-icons/tb';
import type { IBlockWithGeometry } from "@/data/interfaces";

interface BlockItemProps {
  block: IBlockWithGeometry;
  isVisible: boolean;
  onToggleVisibility: (blockId: string) => void;
  onNavigateToGeometry: (geometry: { type: string; coordinates: unknown }[], isPackage?: boolean) => void;
}

export function BlockItem({ block, isVisible, onToggleVisibility, onNavigateToGeometry }: BlockItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        px: 2,
        mb: 1,
        borderRadius: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
        '&:last-child': { mb: 0 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {block.ten_block}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Hiển thị/Ẩn block">
          <Button
            size="small"
            sx={{
              minWidth: 28,
              height: 28,
              p: 0.5,
              borderRadius: '50%',
              color: isVisible ? 'primary.dark' : 'grey.600',
              background: 'transparent',
              boxShadow: 'none',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: 1,
                borderColor: isVisible ? 'primary.dark' : 'grey.500',
                background: 'transparent'
              }
            }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility(block.block_id)
            }}
          >
            {isVisible ? (
              <TbEye className='w-3 h-3' />
            ) : (
              <TbEyeOff className='w-3 h-3' />
            )}
          </Button>
        </Tooltip>
        <Tooltip title="Zoom đến block">
          <Button
            size="small"
            sx={{
              minWidth: 28,
              height: 28,
              p: 0.5,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: 'none',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: 1,
                borderColor: 'primary.dark',
                background: 'transparent'
              }
            }}
            onClick={(e) => {
              e.stopPropagation()
              onNavigateToGeometry(block.geometry || [], true)
            }}
          >
            <TbZoomScan className='w-3 h-3' />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
