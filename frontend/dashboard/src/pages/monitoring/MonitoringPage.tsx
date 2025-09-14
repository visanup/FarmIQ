import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
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
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Sensors as SensorsIcon,
  DeviceHub as DeviceHubIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  WifiOff as WifiOffIcon,
  BatteryAlert as BatteryAlertIcon,
  Thermostat as TemperatureIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDevices, useDeviceHealth, useSensorReadings } from '../../hooks/useApi';
import { Device, DeviceHealth, SensorReading } from '../../types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
      id={`monitoring-tabpanel-${index}`}
      aria-labelledby={`monitoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MonitoringPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: deviceHealth = [], isLoading: healthLoading } = useDeviceHealth();
  const { data: sensorReadings = [], isLoading: readingsLoading } = useSensorReadings();

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return <TemperatureIcon />;
      case 'humidity':
        return <WaterDropIcon />;
      case 'air_quality':
        return <AirIcon />;
      default:
        return <SensorsIcon />;
    }
  };

  const getSensorTypeLabel = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return 'อุณหภูมิ';
      case 'humidity':
        return 'ความชื้น';
      case 'air_quality':
        return 'คุณภาพอากาศ';
      default:
        return sensorType;
    }
  };

  const getSensorUnit = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      case 'air_quality':
        return 'AQI';
      default:
        return '';
    }
  };

  // Generate mock time series data
  const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        temperature: 20 + Math.random() * 10 + Math.sin(i * 0.5) * 3,
        humidity: 60 + Math.random() * 20 + Math.cos(i * 0.3) * 10,
        airQuality: 50 + Math.random() * 30 + Math.sin(i * 0.2) * 15,
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Calculate statistics
  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const offlineDevices = deviceHealth.filter(h => h.status === 'OFFLINE').length;
  const warningDevices = deviceHealth.filter(h => h.status === 'WARNING').length;
  const totalDevices = devices.length;

  const criticalAlerts = deviceHealth.filter(h => 
    h.errors.length > 0 || h.warnings.some(w => w.includes('Critical'))
  ).length;

  if (devicesLoading || healthLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลการตรวจสอบ...</Typography>
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
              ตรวจสอบระบบ
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ตรวจสอบสถานะอุปกรณ์และข้อมูลเซ็นเซอร์แบบเรียลไทม์
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="รีเฟรชอัตโนมัติ"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={!autoRefresh}
            >
              รีเฟรช
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
                      อุปกรณ์ออนไลน์
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
                      อุปกรณ์ออฟไลน์
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
                    <Typography variant="h6">{warningDevices}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      อุปกรณ์เตือน
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
              <Tab label="สถานะอุปกรณ์" />
              <Tab label="ข้อมูลเซ็นเซอร์" />
              <Tab label="กราฟข้อมูล" />
            </Tabs>
          </Box>

          {/* Device Status Tab */}
          <TabPanel value={tabValue} index={0}>
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
                              <SensorsIcon />
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Sensor Data Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {sensorReadings.map((reading) => (
                <Grid item xs={12} sm={6} md={4} key={reading.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          {getSensorIcon(reading.sensorType)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {reading.value} {getSensorUnit(reading.sensorType)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getSensorTypeLabel(reading.sensorType)}
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

          {/* Charts Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      อุณหภูมิ 24 ชั่วโมง
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#2e7d32" 
                          strokeWidth={2}
                          dot={{ fill: '#2e7d32' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ความชื้น 24 ชั่วโมง
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="#4caf50" 
                          strokeWidth={2}
                          dot={{ fill: '#4caf50' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      สถานะอุปกรณ์
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={[
                        { name: 'ออนไลน์', value: onlineDevices, color: '#4caf50' },
                        { name: 'ออฟไลน์', value: offlineDevices, color: '#f44336' },
                        { name: 'เตือน', value: warningDevices, color: '#ff9800' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#2e7d32" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default MonitoringPage;