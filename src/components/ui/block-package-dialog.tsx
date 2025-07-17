import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Chip,
  Alert
} from "@mui/material";
import { Inventory, Close, Save } from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { IBlockWithGeometry } from "@/data/interfaces";
import { usePackages } from "@/hooks/usePackages";
import { ETrangThai } from "@/data/enums";

interface BlockPackageDialogProps {
  open: boolean;
  onClose: () => void;
  block: IBlockWithGeometry | null;
  onSave: (blockId: string, packageId: string) => void;
}

export function BlockPackageDialog({
  open,
  onClose,
  block,
  onSave
}: BlockPackageDialogProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const { packages, isLoading } = usePackages();

  useEffect(() => {
    if (open) {
      setSelectedPackageId("");
      setNote("");
    }
  }, [open]);

  const handleSave = () => {
    if (!block || !selectedPackageId) return;
    
    onSave(block.block_id, selectedPackageId);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPackageId("");
    setNote("");
    onClose();
  };

  const selectedPackage = packages?.find(pkg => pkg.package_id === selectedPackageId);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory color="primary" />
          <Typography variant="h6" component="span">
            Gắn gói thầu cho block
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {block && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Thông tin block:
            </Typography>
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tên block:</strong> {block.ten_block}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>ID:</strong> {block.block_id}
              </Typography>
              <Typography variant="body2">
                <strong>Trạng thái:</strong>
                <Chip 
                  label={block.trang_thai} 
                  size="small" 
                  sx={{ ml: 1 }}
                  color={block.trang_thai === ETrangThai.COMPLETED ? 'success' : 'warning'}
                />
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Chọn gói thầu</InputLabel>
            <Select
              value={selectedPackageId}
              label="Chọn gói thầu"
              onChange={(e) => setSelectedPackageId(e.target.value)}
              disabled={isLoading}
            >
              {packages?.map((pkg) => (
                <MenuItem key={pkg.package_id} value={pkg.package_id}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {pkg.ten_goi_thau}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {pkg.package_id} • {pkg.nha_thau || 'Chưa có nhà thầu'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedPackage && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Gói thầu đã chọn:</strong> {selectedPackage.ten_goi_thau}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Tiến độ: {selectedPackage.tien_do_thuc_te}% • 
                Nhà thầu: {selectedPackage.nha_thau || 'Chưa có'}
              </Typography>
            </Alert>
          </Box>
        )}

        <TextField
          fullWidth
          label="Ghi chú (tùy chọn)"
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú về việc gắn gói thầu này..."
          sx={{ mb: 2 }}
        />

        <Typography variant="caption" color="text.secondary">
          * Block sẽ được gắn với gói thầu đã chọn và thông tin sẽ được lưu vào hệ thống
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          startIcon={<Close />}
          sx={{ minWidth: '120px' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          disabled={!selectedPackageId || isLoading}
          sx={{ minWidth: '120px' }}
        >
          Lưu gói thầu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
