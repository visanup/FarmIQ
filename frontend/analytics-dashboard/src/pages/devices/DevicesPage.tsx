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
  LinearProgress,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Sensors as SensorsIcon,
  DeviceHub as DeviceHubIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  BatteryAlert as BatteryAlertIcon,
  Thermostat as TemperatureIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDevices, useDeviceHealth, useSensorReadings } from '../../hooks/useApi';
import { Device, DeviceHealth, SensorReading } from '../../types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`devices-tabpanel-${index}`}
      aria-labelledby={`devices-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DevicesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    deviceTypeId: '',
    farmId: '',
    houseId: '',
    location: { x: 0, y: 0, z: 0 },
  });

  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: deviceHealth = [], isLoading: healthLoading } = useDeviceHealth();
  const { data: sensorReadings = [], isLoading: readingsLoading } = useSensorReadings();

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', device?: Device) => {
    setDialogMode(mode);
    if (device) {
      setSelectedDevice(device);
      setFormData({
        name: device.name,
        serialNumber: device.serialNumber,
        deviceTypeId: device.deviceTypeId,
        farmId: device.farmId,
        houseId: device.houseId || '',
        location: device.location,
      });
    } else {
      setSelectedDevice(null);
      setFormData({
        name: '',
        serialNumber: '',
        deviceTypeId: '',
        farmId: '',
        houseId: '',
        location: { x: 0, y: 0, z: 0 },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDevice(null);
    setFormData({
      name: '',
      serialNumber: '',
      deviceTypeId: '',
      farmId: '',
      houseId: '',
      location: { x: 0, y: 0, z: 0 },
    });
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving device:', formData);
    handleCloseDialog();
  };

  const getDeviceStatus = (deviceId: string) => {
    const health = deviceHealth.find(h => h.deviceId === deviceId);
    if (!health) return { status: 'unknown', color: 'default', icon: <ErrorIcon /> };
    
    switch (health.status) {
      case 'ONLINE':
        return { status: 'ออนไลน์', color: 'success', icon: <CheckCircleIcon /> };
      case 'OFFLINE':
        return { status: 'ออฟไลน์', color: 'error', icon: <WifiOffIcon /> };
      case 'WARNING':
        return { status: 'เตือน', color: 'warning', icon: <WarningIcon /> };
      default:
        return { status: 'ไม่ทราบ', color: 'default', icon: <ErrorIcon /> };
    }
  };

  const getDeviceTypeIcon = (deviceTypeId: string) => {
    switch (deviceTypeId) {
      case 'sensor-temp':
        return <TemperatureIcon />;
      case 'sensor-humidity':
        return <WaterDropIcon />;
      case 'sensor-air':
        return <AirIcon />;
      default:
        return <SensorsIcon />;
    }
  };

  const getDeviceTypeLabel = (deviceTypeId: string) => {
    switch (deviceTypeId) {
      case 'sensor-temp':
        return 'เซ็นเซอร์อุณหภูมิ';
      case 'sensor-humidity':
        return 'เซ็นเซอร์ความชื้น';
      case 'sensor-air':
        return 'เซ็นเซอร์คุณภาพอากาศ';
      default:
        return 'อุปกรณ์อื่นๆ';
    }
  };

  const getDeviceTypeColor = (deviceTypeId: string) => {
    switch (deviceTypeId) {
      case 'sensor-temp':
        return 'error';
      case 'sensor-humidity':
        return 'info';
      case 'sensor-air':
        return 'success';
      default:
        return 'default';
    }
  };

  // Calculate statistics
  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const offlineDevices = deviceHealth.filter(h => h.status === 'OFFLINE').length;
  const warningDevices = deviceHealth.filter(h => h.status === 'WARNING').length;
  const totalDevices = devices.length;

  const criticalAlerts = deviceHealth.filter(h => 
    h.errors.length > 0 || h.warnings.some(w => w.includes('Critical'))
  ).length;

  const lowBatteryDevices = deviceHealth.filter(h => (h.batteryLevel || 0) < 20).length;

  if (devicesLoading || healthLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลอุปกรณ์...</Typography>
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
              จัดการอุปกรณ์
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ดูและจัดการอุปกรณ์เซ็นเซอร์ทั้งหมดในระบบ
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
            >
              เพิ่มอุปกรณ์
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{onlineDevices}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ออนไลน์
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
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <WifiOffIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{offlineDevices}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ออฟไลน์
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
                    <BatteryAlertIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{lowBatteryDevices}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      แบตเตอรี่ต่ำ
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
                    <DeviceHubIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{totalDevices}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      อุปกรณ์ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Critical Alerts */}
        {criticalAlerts > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>การแจ้งเตือนสำคัญ</AlertTitle>
            มีอุปกรณ์ {criticalAlerts} ตัวที่มีปัญหาที่ต้องแก้ไขด่วน
          </Alert>
        )}

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="รายการอุปกรณ์" />
              <Tab label="สถานะสุขภาพ" />
              <Tab label="ข้อมูลเซ็นเซอร์" />
            </Tabs>
          </Box>

          {/* Devices List Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {devices.map((device) => {
                const health = deviceHealth.find(h => h.deviceId === device.id);
                const status = getDeviceStatus(device.id);
                const recentReadings = sensorReadings
                  .filter(r => r.deviceId === device.id)
                  .slice(0, 3);

                return (
                  <Grid item xs={12} sm={6} md={4} key={device.id}>
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
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              {getDeviceTypeIcon(device.deviceTypeId)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" component="h3">
                                {device.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {device.serialNumber}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            icon={status.icon}
                            label={status.status}
                            color={status.color as any}
                            size="small"
                          />
                        </Box>

                        <Box mb={2}>
                          <Chip
                            label={getDeviceTypeLabel(device.deviceTypeId)}
                            color={getDeviceTypeColor(device.deviceTypeId) as any}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>

                        {/* Device Health */}
                        {health && (
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                แบตเตอรี่
                              </Typography>
                              <Typography variant="body2">
                                {health.batteryLevel}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={health.batteryLevel || 0}
                              color={health.batteryLevel && health.batteryLevel < 20 ? 'error' : 'primary'}
                              sx={{ mb: 1 }}
                            />
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="body2" color="text.secondary">
                                สัญญาณ
                              </Typography>
                              <Typography variant="body2">
                                {health.signalStrength}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={health.signalStrength || 0}
                              color="secondary"
                            />
                          </Box>
                        )}

                        {/* Recent Readings */}
                        {recentReadings.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              ข้อมูลล่าสุด:
                            </Typography>
                            {recentReadings.map((reading, index) => (
                              <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption">
                                  {reading.sensorType === 'temperature' ? 'อุณหภูมิ' :
                                   reading.sensorType === 'humidity' ? 'ความชื้น' : reading.sensorType}
                                </Typography>
                                <Typography variant="caption" fontWeight="medium">
                                  {reading.value} {reading.unit}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleOpenDialog('view', device)}
                            fullWidth
                          >
                            ดูรายละเอียด
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', device)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => console.log('Delete device:', device.id)}
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
          </TabPanel>

          {/* Health Status Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>อุปกรณ์</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>แบตเตอรี่</TableCell>
                    <TableCell>สัญญาณ</TableCell>
                    <TableCell>อุณหภูมิ</TableCell>
                    <TableCell>การแจ้งเตือน</TableCell>
                    <TableCell>อัปเดตล่าสุด</TableCell>
                    <TableCell>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((device) => {
                    const health = deviceHealth.find(h => h.deviceId === device.id);
                    const status = getDeviceStatus(device.id);
                    
                    return (
                      <TableRow key={device.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              {getDeviceTypeIcon(device.deviceTypeId)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {device.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {device.serialNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={status.icon}
                            label={status.status}
                            color={status.color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={health?.batteryLevel || 0}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {health?.batteryLevel || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={health?.signalStrength || 0}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {health?.signalStrength || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {health?.temperature ? `${health.temperature}°C` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            {health?.errors.length > 0 && (
                              <Tooltip title={`ข้อผิดพลาด: ${health.errors.join(', ')}`}>
                                <ErrorIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                            {health?.warnings.length > 0 && (
                              <Tooltip title={`คำเตือน: ${health.warnings.join(', ')}`}>
                                <WarningIcon color="warning" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {health?.lastSeen ? new Date(health.lastSeen).toLocaleString('th-TH') : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" color="primary">
                              <SettingsIcon />
                            </IconButton>
                            <IconButton size="small" color="secondary">
                              <RefreshIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Sensor Data Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {sensorReadings.map((reading) => (
                <Grid item xs={12} sm={6} md={4} key={reading.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          {getDeviceTypeIcon(reading.deviceId)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {reading.value} {reading.unit}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reading.sensorType === 'temperature' ? 'อุณหภูมิ' :
                             reading.sensorType === 'humidity' ? 'ความชื้น' : reading.sensorType}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        อัปเดต: {new Date(reading.timestamp).toLocaleString('th-TH')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Card>

        {/* Device Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' && 'เพิ่มอุปกรณ์ใหม่'}
            {dialogMode === 'edit' && 'แก้ไขข้อมูลอุปกรณ์'}
            {dialogMode === 'view' && 'รายละเอียดอุปกรณ์'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="ชื่ออุปกรณ์"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="หมายเลขซีเรียล"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <FormControl fullWidth margin="normal" disabled={dialogMode === 'view'}>
                <InputLabel>ประเภทอุปกรณ์</InputLabel>
                <Select
                  value={formData.deviceTypeId}
                  onChange={(e) => setFormData({ ...formData, deviceTypeId: e.target.value })}
                  label="ประเภทอุปกรณ์"
                >
                  <MenuItem value="sensor-temp">เซ็นเซอร์อุณหภูมิ</MenuItem>
                  <MenuItem value="sensor-humidity">เซ็นเซอร์ความชื้น</MenuItem>
                  <MenuItem value="sensor-air">เซ็นเซอร์คุณภาพอากาศ</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" disabled={dialogMode === 'view'}>
                <InputLabel>ฟาร์ม</InputLabel>
                <Select
                  value={formData.farmId}
                  onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  label="ฟาร์ม"
                >
                  <MenuItem value="farm-1">ฟาร์มโคนมสวนผัก</MenuItem>
                  <MenuItem value="farm-2">ฟาร์มไก่ไข่บ้านนา</MenuItem>
                  <MenuItem value="farm-3">ฟาร์มหมูออร์แกนิก</MenuItem>
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

export default DevicesPage;