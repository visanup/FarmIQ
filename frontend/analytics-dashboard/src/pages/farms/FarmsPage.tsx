import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Scale as ScaleIcon,
  Agriculture as AgricultureIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useFarms, useAnimals, useDevices } from '../../hooks/useApi';
import { Farm, Animal, Device } from '../../types/api';

const FarmsPage: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    type: '',
  });

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: devices = [], isLoading: devicesLoading } = useDevices();

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', farm?: Farm) => {
    setDialogMode(mode);
    if (farm) {
      setSelectedFarm(farm);
      setFormData({
        name: farm.name,
        location: farm.location,
        size: farm.size.toString(),
        type: farm.type,
      });
    } else {
      setSelectedFarm(null);
      setFormData({
        name: '',
        location: '',
        size: '',
        type: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFarm(null);
    setFormData({
      name: '',
      location: '',
      size: '',
      type: '',
    });
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving farm:', formData);
    handleCloseDialog();
  };

  const getFarmStats = (farmId: string) => {
    const farmAnimals = animals.filter(animal => animal.farmId === farmId);
    const farmDevices = devices.filter(device => device.farmId === farmId);
    const onlineDevices = farmDevices.filter(device => 
      devices.find(d => d.id === device.id)?.isActive
    ).length;

    return {
      animalCount: farmAnimals.length,
      deviceCount: farmDevices.length,
      onlineDevices,
      offlineDevices: farmDevices.length - onlineDevices,
    };
  };

  const getFarmTypeIcon = (type: string) => {
    switch (type) {
      case 'dairy':
        return '🐄';
      case 'poultry':
        return '🐔';
      case 'swine':
        return '🐷';
      case 'cattle':
        return '🐂';
      default:
        return '🌾';
    }
  };

  const getFarmTypeColor = (type: string) => {
    switch (type) {
      case 'dairy':
        return 'primary';
      case 'poultry':
        return 'secondary';
      case 'swine':
        return 'warning';
      case 'cattle':
        return 'info';
      default:
        return 'default';
    }
  };

  const getFarmTypeLabel = (type: string) => {
    switch (type) {
      case 'dairy':
        return 'โคนม';
      case 'poultry':
        return 'ไก่ไข่';
      case 'swine':
        return 'หมู';
      case 'cattle':
        return 'โคเนื้อ';
      default:
        return 'อื่นๆ';
    }
  };

  if (farmsLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลฟาร์ม...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              จัดการฟาร์ม
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ดูและจัดการข้อมูลฟาร์มทั้งหมดในระบบ
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{ borderRadius: 2 }}
          >
            เพิ่มฟาร์มใหม่
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AgricultureIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{farms.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ฟาร์มทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {farms.filter(farm => farm.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ฟาร์มที่ใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <ScaleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {farms.reduce((total, farm) => total + farm.size, 0).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ไร่ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {farms.filter(farm => !farm.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ฟาร์มที่หยุดใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Farms Grid */}
        <Grid container spacing={3}>
          {farms.map((farm) => {
            const stats = getFarmStats(farm.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={farm.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                          {getFarmTypeIcon(farm.type)}
                        </Typography>
                        <Typography variant="h6" component="h3">
                          {farm.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={getFarmTypeLabel(farm.type)}
                        color={getFarmTypeColor(farm.type) as any}
                        size="small"
                      />
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {farm.location}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <ScaleIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {farm.size} ไร่
                      </Typography>
                    </Box>

                    {/* Stats */}
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary">
                            {stats.animalCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            สัตว์
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="secondary">
                            {stats.deviceCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            อุปกรณ์
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Device Status */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        สถานะอุปกรณ์:
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Tooltip title="ออนไลน์">
                          <Badge badgeContent={stats.onlineDevices} color="success">
                            <CheckCircleIcon color="success" fontSize="small" />
                          </Badge>
                        </Tooltip>
                        <Tooltip title="ออฟไลน์">
                          <Badge badgeContent={stats.offlineDevices} color="error">
                            <WarningIcon color="error" fontSize="small" />
                          </Badge>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleOpenDialog('view', farm)}
                        fullWidth
                      >
                        ดูรายละเอียด
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', farm)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => console.log('Delete farm:', farm.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Farm Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' && 'เพิ่มฟาร์มใหม่'}
            {dialogMode === 'edit' && 'แก้ไขข้อมูลฟาร์ม'}
            {dialogMode === 'view' && 'รายละเอียดฟาร์ม'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="ชื่อฟาร์ม"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="ที่ตั้ง"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="ขนาด (ไร่)"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <FormControl fullWidth margin="normal" disabled={dialogMode === 'view'}>
                <InputLabel>ประเภทฟาร์ม</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="ประเภทฟาร์ม"
                >
                  <MenuItem value="dairy">โคนม</MenuItem>
                  <MenuItem value="poultry">ไก่ไข่</MenuItem>
                  <MenuItem value="swine">หมู</MenuItem>
                  <MenuItem value="cattle">โคเนื้อ</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {dialogMode !== 'view' && (
              <Button onClick={handleSave} variant="contained">
                {dialogMode === 'create' ? 'เพิ่ม' : 'บันทึก'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default FarmsPage;

