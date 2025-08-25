import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Router as RouterIcon,
  Sensors as SensorsIcon,
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Battery3Bar as BatteryIcon,
  SignalWifi4Bar as SignalIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

interface Device {
  id: string;
  name: string;
  customerId: number; // Add customer ID for filtering
  type: 'sensor' | 'gateway' | 'controller';
  status: 'online' | 'offline' | 'warning';
  farm: string;
  location: string;
  battery?: number;
  signal?: number;
  lastSeen: string;
  version: string;
  data?: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
  };
}

const mockDevices: Device[] = [
  {
    id: 'TEMP-001',
    name: 'เซ็นเซอร์อุณหภูมิ #1',
    customerId: 1,
    type: 'sensor',
    status: 'online',
    farm: 'ฟาร์มเกษตรอินทรีย์',
    location: 'โรงเรือน A',
    battery: 85,
    signal: 92,
    lastSeen: '2024-01-15T14:30:00Z',
    version: '1.2.3',
    data: { temperature: 28.5, humidity: 65 }
  },
  {
    id: 'GATEWAY-001',
    name: 'เกตเวย์หลัก',
    customerId: 1,
    type: 'gateway',
    status: 'online',
    farm: 'ฟาร์มเกษตรอินทรีย์',
    location: 'คลังสินค้า',
    signal: 88,
    lastSeen: '2024-01-15T14:29:00Z',
    version: '2.1.0'
  },
  {
    id: 'WATER-002',
    name: 'เซ็นเซอร์ระดับน้ำ',
    customerId: 2,
    type: 'sensor',
    status: 'warning',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
    location: 'ถังเก็บน้ำ',
    battery: 23,
    signal: 67,
    lastSeen: '2024-01-15T12:15:00Z',
    version: '1.1.8',
    data: { soilMoisture: 45 }
  },
  {
    id: 'CTRL-001',
    name: 'ตัวควบคุมรดน้ำ',
    customerId: 1,
    type: 'controller',
    status: 'offline',
    farm: 'ฟาร์มผักปลอดสาร',
    location: 'แปลง C',
    signal: 0,
    lastSeen: '2024-01-14T18:30:00Z',
    version: '3.0.1'
  },
  {
    id: 'TEMP-002',
    name: 'เซ็นเซอร์ความชื้น',
    customerId: 2,
    type: 'sensor',
    status: 'online',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
    location: 'บ่อเลี้ยง B',
    battery: 78,
    signal: 84,
    lastSeen: '2024-01-15T14:25:00Z',
    version: '1.3.2',
    data: { humidity: 72 }
  }
];

const DevicesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state } = useDashboard();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  // Customer filtering for devices
  const [allDevices] = useState<Device[]>(mockDevices);
  const [devices, setDevices] = useState<Device[]>([]);
  
  // Filter devices based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all devices
      setDevices(allDevices);
    } else if (state.currentCustomer) {
      // Regular customer sees only their devices
      const customerDevices = allDevices.filter(device => device.customerId === state.currentCustomer?.id);
      setDevices(customerDevices);
    } else {
      // No access
      setDevices([]);
    }
  }, [state.currentCustomer, state.isAdmin, allDevices]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return <SensorsIcon />;
      case 'gateway': return <RouterIcon />;
      case 'controller': return <SettingsIcon />;
      default: return <DevicesIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <OnlineIcon sx={{ color: theme.palette.success.main }} />;
      case 'offline': return <OfflineIcon sx={{ color: theme.palette.error.main }} />;
      default: return <OnlineIcon sx={{ color: theme.palette.warning.main }} />;
    }
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const warningDevices = devices.filter(d => d.status === 'warning').length;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, deviceId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(deviceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDevice(null);
  };

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <CustomerAwarePageHeader
        title="📱 จัดการอุปกรณ์และเซ็นเซอร์"
        subtitle="ติดตามสถานะและจัดการอุปกรณ์ IoT ในฟาร์ม"
        actionButton={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            เพิ่มอุปกรณ์
          </Button>
        }
        noDataMessage={devices.length === 0 ? "ไม่พบอุปกรณ์สำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Summary Cards */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 }
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
            <Avatar sx={{ bgcolor: theme.palette.success.main + '15', color: theme.palette.success.main, mx: 'auto', mb: 2 }}>
              <OnlineIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {onlineDevices}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ออนไลน์
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
            <Avatar sx={{ bgcolor: theme.palette.warning.main + '15', color: theme.palette.warning.main, mx: 'auto', mb: 2 }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {warningDevices}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คำเตือน
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
            <Avatar sx={{ bgcolor: theme.palette.error.main + '15', color: theme.palette.error.main, mx: 'auto', mb: 2 }}>
              <OfflineIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {offlineDevices}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ออฟไลน์
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main + '15', color: theme.palette.primary.main, mx: 'auto', mb: 2 }}>
              <DevicesIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {devices.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ทั้งหมด
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Devices Table */}
      <Card>
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            รายการอุปกรณ์
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 2 }}
            >
              รีเฟรช
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              เพิ่มอุปกรณ์
            </Button>
          </Stack>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>อุปกรณ์</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>ฟาร์ม/ตำแหน่ง</TableCell>
                <TableCell>แบตเตอรี่</TableCell>
                <TableCell>สัญญาณ</TableCell>
                <TableCell>ข้อมูลล่าสุด</TableCell>
                <TableCell>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getStatusColor(device.status) + '15',
                          color: getStatusColor(device.status),
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 }
                        }}
                      >
                        {getDeviceIcon(device.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {device.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {device.id} • v{device.version}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(device.status)}
                      <Chip
                        label={device.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(device.status) + '15',
                          color: getStatusColor(device.status),
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {device.farm}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {device.location}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {device.battery !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 60 }}>
                        <BatteryIcon 
                          sx={{ 
                            color: device.battery > 30 ? theme.palette.success.main : theme.palette.warning.main,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {device.battery}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {device.signal !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 60 }}>
                        <SignalIcon 
                          sx={{ 
                            color: device.signal > 70 ? theme.palette.success.main : 
                                  device.signal > 30 ? theme.palette.warning.main : theme.palette.error.main,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {device.signal}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(device.lastSeen).toLocaleString('th-TH')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, device.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>แก้ไข</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ตั้งค่า</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>รีสตาร์ท</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default DevicesPage;