import type { IPlanningArea } from "@/data/interfaces";
import { Layers } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useCallback } from "react";

interface LayerToggleButtonProps {
  planningAreaList?: IPlanningArea;
  open: boolean;
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
}

export function LayerToggleButton({ planningAreaList, open, isAnimating, setIsAnimating, anchorEl, setAnchorEl }: LayerToggleButtonProps) {
  const handleTogglePanel = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setTimeout(() => setIsAnimating(false), 200);
  }, [anchorEl, isAnimating, setIsAnimating, setAnchorEl]);

  const totalGeometries = (planningAreaList?.zones?.length || 0) + (planningAreaList?.zones?.reduce((total, zone) => total + (zone.blocks?.length || 0), 0) || 0);

  return (
    <Box className="relative">
      <Button
        onClick={handleTogglePanel}
        variant="contained"
        disabled={isAnimating}
        sx={{
          minWidth: 48,
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: open ? 'primary.dark' : 'background.paper',
          color: open ? 'white' : 'text.primary',
          border: open ? 'none' : '1px solid',
          borderColor: 'divider',
          boxShadow: open ? 3 : 2,
          '&:hover': {
            bgcolor: open ? 'primary.dark' : 'grey.100',
            transform: 'translateY(-1px)',
            boxShadow: open ? 4 : 3
          },
          transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Layers fontSize="medium" />
      </Button>

      {totalGeometries > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: '2px solid white',
            boxShadow: 2,
            zIndex: 10,
          }}
        >
          {totalGeometries}
        </Box>
      )}
    </Box>
  );
}