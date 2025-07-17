import { Layers } from "@mui/icons-material";
import { Box, Button } from "@mui/material";

interface LayerToggleButtonProps {
  isOpen: boolean;
  isAnimating: boolean;
  totalGeometries: number;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export function LayerToggleButton({ isOpen, isAnimating, totalGeometries, onClick }: LayerToggleButtonProps) {
  return (
    <Box className="relative">
      <Button
        onClick={onClick}
        variant="contained"
        disabled={isAnimating}
        sx={{
          minWidth: 48,
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: isOpen ? 'primary.dark' : 'background.paper',
          color: isOpen ? 'white' : 'text.primary',
          border: isOpen ? 'none' : '1px solid',
          borderColor: 'divider',
          boxShadow: isOpen ? 3 : 2,
          '&:hover': {
            bgcolor: isOpen ? 'primary.dark' : 'grey.100',
            transform: 'translateY(-1px)',
            boxShadow: isOpen ? 4 : 3
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
