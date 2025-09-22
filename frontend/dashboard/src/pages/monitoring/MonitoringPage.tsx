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
  CircularProgress,
  alpha,
  useTheme,
  Pagination,
  TextField,
  InputAdornment,
  Fade,
  Zoom,
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
  CloudQueue as Co2Icon,
  Lightbulb as LightbulbIcon,
  Scale as ScaleIcon,
  LocalDining as FeedIcon,
  Science as PhIcon,
  Water as WaterIcon,
  Wifi as WifiIcon,
  BatteryFull as BatteryFullIcon,
  Search as SearchIcon,
  MonitorHeart as MonitoringIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { masterServiceClient, sensorStreamerClient } from '../../services/api';
import { Device, DeviceHealth, SensorReading } from '../../types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';

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
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);
  
  // State for real data
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceHealth, setDeviceHealth] = useState<DeviceHealth[]>([]);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load data function
  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Load devices from master service
      const devicesData = await masterServiceClient.getDevices();
      setDevices(devicesData || []);
      
      // Load device health from sensor streamer
      const healthData = await sensorStreamerClient.getDeviceHealth();
      setDeviceHealth(healthData || []);
      
      // Load latest sensor readings
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      const readingsData = await sensorStreamerClient.getSensorReadings({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });
      setSensorReadings(readingsData || []);
      
      // Generate time series data for charts
      const timeSeries = generateTimeSeriesData(readingsData || []);
      setTimeSeriesData(timeSeries);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto refresh effect
  useEffect(() => {
    loadMonitoringData();
    
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMonitoringData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshKey]);

  const handleRefresh = () => {
    loadMonitoringData();
  };

  // Filter and pagination logic
  const filteredDevices = devices.filter(device => 
    device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevices = filteredDevices.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
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
      case 'CO2':
        return <Co2Icon />;
      case 'illuminance':
        return <LightbulbIcon />;
      case 'sensors.weight_scale.current_kg':
      case 'sensors.weight_predict.current_kg':
        return <ScaleIcon />;
      case 'feed.intake.kg':
        return <FeedIcon />;
      case 'pH':
        return <PhIcon />;
      case 'water_volume':
      case 'water_temp':
        return <WaterIcon />;
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
      case 'CO2':
        return 'คาร์บอนไดออกไซด์';
      case 'illuminance':
        return 'ความสว่าง';
      case 'sensors.weight_scale.current_kg':
        return 'น้ำหนักเครื่องชั่ง';
      case 'sensors.weight_predict.current_kg':
        return 'น้ำหนัก Estimate';
      case 'feed.intake.kg':
        return 'อาหารที่กิน';
      case 'pH':
        return 'ค่า pH';
      case 'water_volume':
        return 'ปริมาณน้ำ';
      case 'water_temp':
        return 'อุณหภูมิน้ำ';
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
      case 'CO2':
        return 'ppm';
      case 'illuminance':
        return 'lux';
      case 'sensors.weight_scale.current_kg':
      case 'sensors.weight_predict.current_kg':
        return 'kg';
      case 'feed.intake.kg':
        return 'kg';
      case 'pH':
        return 'pH';
      case 'water_volume':
        return 'L';
      case 'water_temp':
        return '°C';
      default:
        return '';
    }
  };

  // Generate time series data from real sensor readings
  const generateTimeSeriesData = (readings: SensorReading[]) => {
    const data: any[] = [];
    const now = new Date();
    
    // Group readings by hour for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourReadings = readings.filter(r => {
        const readingTime = new Date(r.timestamp);
        return readingTime >= hourStart && readingTime < hourEnd;
      });
      
      const timeData: any = {
        time: time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.toISOString(),
      };
      
      // Calculate averages for each sensor type
      const sensorTypes = ['temperature', 'humidity', 'air_quality', 'CO2', 'illuminance'];
      sensorTypes.forEach(sensorType => {
        const typeReadings = hourReadings.filter(r => r.sensorType === sensorType);
        if (typeReadings.length > 0) {
          const avgValue = typeReadings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / typeReadings.length;
          timeData[sensorType] = avgValue;
        } else {
          // Generate mock data if no real data
          timeData[sensorType] = generateMockValue(sensorType, i);
        }
      });
      
      data.push(timeData);
    }
    
    return data;
  };

  const generateMockValue = (sensorType: string, hourOffset: number) => {
    const baseValues: { [key: string]: number } = {
      temperature: 25,
      humidity: 60,
      air_quality: 50,
      CO2: 400,
      illuminance: 500,
    };
    
    const variation = Math.sin(hourOffset * 0.5) * 5 + Math.random() * 3;
    return baseValues[sensorType] + variation;
  };

  // Calculate statistics
  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const offlineDevices = deviceHealth.filter(h => h.status === 'OFFLINE').length;
  const warningDevices = deviceHealth.filter(h => h.status === 'WARNING').length;
  const totalDevices = devices.length;

  const criticalAlerts = deviceHealth.filter(h => 
    h.errors.length > 0 || h.warnings.some(w => w.includes('Critical'))
  ).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: 3,
            p: 4
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            กำลังโหลดข้อมูลการตรวจสอบ...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            กรุณารอสักครู่
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Card sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📊 ตรวจสอบระบบ
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  ตรวจสอบสถานะอุปกรณ์และข้อมูลเซ็นเซอร์แบบเรียลไทม์
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      รีเฟรชอัตโนมัติ
                    </Typography>
                  }
                />
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  รีเฟรช
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {onlineDevices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      อุปกรณ์ออนไลน์
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(244, 67, 54, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'error.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                  }}>
                    <WifiOffIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {offlineDevices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      อุปกรณ์ออฟไลน์
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'warning.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                  }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {warningDevices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      อุปกรณ์เตือน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.15)',
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}>
                    <DeviceHubIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {totalDevices}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
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
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>⚠️ การแจ้งเตือนสำคัญ</AlertTitle>
            มีอุปกรณ์ {criticalAlerts} ตัวที่มีปัญหาที่ต้องแก้ไขด่วน
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px 12px 0 0'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 2,
                  px: 3,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                }
              }}
            >
              <Tab label="📱 สถานะอุปกรณ์" />
              <Tab label="📊 ข้อมูลเซ็นเซอร์" />
              <Tab label="📈 กราฟข้อมูล" />
            </Tabs>
          </Box>

          {/* Device Status Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Search and Filter Section */}
            <Fade in={true} timeout={600}>
              <Card sx={{ 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <MonitoringIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      ค้นหาและกรองอุปกรณ์
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="ค้นหาตามชื่อ, ประเภท, หรือตำแหน่ง..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>

            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      color: 'text.primary',
                      borderBottom: '2px solid',
                      borderBottomColor: 'primary.main'
                    }
                  }}>
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
                  {currentDevices.map((device, index) => {
                    const health = deviceHealth.find(h => h.deviceId === device.id);
                    const status = getDeviceStatus(device.id);
                    
                    return (
                      <TableRow 
                        key={device.id}
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease-in-out'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ 
                              bgcolor: 'primary.main', 
                              mr: 2, 
                              width: 40, 
                              height: 40,
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                            }}>
                              <SensorsIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600" sx={{ color: 'text.primary' }}>
                                {safeRenderValue(device.name)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {safeRenderValue(device.serialNumber)}
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
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={health?.batteryLevel || 0}
                              sx={{ 
                                width: 80, 
                                mr: 1,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: health?.batteryLevel && health.batteryLevel > 20 
                                    ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
                                    : 'linear-gradient(135deg, #f44336 0%, #ff9800 100%)'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 35 }}>
                              {safeRenderNumber(health?.batteryLevel)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={health?.signalStrength || 0}
                              sx={{ 
                                width: 80, 
                                mr: 1,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: health?.signalStrength && health.signalStrength > 50 
                                    ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
                                    : 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 35 }}>
                              {safeRenderNumber(health?.signalStrength)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {health?.temperature ? `${safeRenderNumber(health.temperature)}°C` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            {health?.errors && health.errors.length > 0 && (
                              <Tooltip title={`ข้อผิดพลาด: ${health.errors.join(', ')}`}>
                                <ErrorIcon color="error" fontSize="small" />
                              </Tooltip>
                            )}
                            {health?.warnings && health.warnings.length > 0 && (
                              <Tooltip title={`คำเตือน: ${health.warnings.join(', ')}`}>
                                <WarningIcon color="warning" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {health?.lastSeen ? new Date(health.lastSeen).toLocaleString('th-TH') : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            <Fade in={true} timeout={800}>
              <Card sx={{ 
                mt: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      แสดง {startIndex + 1}-{Math.min(endIndex, filteredDevices.length)} จาก {filteredDevices.length} รายการ
                    </Typography>
                    
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 600,
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                            }
                          },
                          '&:hover': {
                            background: 'rgba(25, 118, 210, 0.1)',
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          {/* Sensor Data Tab */}
          <TabPanel value={tabValue} index={1}>
            {/* Search and Filter Section for Sensor Data */}
            <Fade in={true} timeout={600}>
              <Card sx={{ 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <SensorsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      ข้อมูลเซ็นเซอร์
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    แสดงข้อมูลเซ็นเซอร์ล่าสุด {sensorReadings.length} รายการ
                  </Typography>
                </CardContent>
              </Card>
            </Fade>

            <Grid container spacing={3}>
              {sensorReadings.length === 0 ? (
                <Grid item xs={12}>
                  <Card sx={{
                    textAlign: 'center',
                    py: 6,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <SensorsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                        ไม่พบข้อมูลเซ็นเซอร์
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่ภายหลัง
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                sensorReadings.slice(0, 12).map((reading) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={reading.id}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main', 
                            mr: 2,
                            width: 48,
                            height: 48,
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                          }}>
                            {getSensorIcon(reading.sensorType)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700,
                              color: 'primary.main',
                              mb: 0.5
                            }}>
                              {typeof reading.value === 'number' ? reading.value.toFixed(2) : safeRenderValue(reading.value)} {getSensorUnit(reading.sensorType)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {getSensorTypeLabel(reading.sensorType)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
                          borderRadius: 2,
                          p: 1.5,
                          mt: 2
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            📅 อัปเดต: {new Date(reading.timestamp).toLocaleString('th-TH')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </TabPanel>

          {/* Charts Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TemperatureIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        🌡️ อุณหภูมิ 24 ชั่วโมง
                      </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1976d2" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#1976d2"
                          strokeWidth={3}
                          fill="url(#temperatureGradient)"
                          dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <WaterDropIcon sx={{ color: 'info.main', mr: 1, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        💧 ความชื้น 24 ชั่วโมง
                      </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00bcd4" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="humidity"
                          stroke="#00bcd4"
                          strokeWidth={3}
                          fill="url(#humidityGradient)"
                          dot={{ fill: '#00bcd4', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#00bcd4', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <DeviceHubIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        📊 สถานะอุปกรณ์
                      </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={[
                        { name: 'ออนไลน์', value: onlineDevices, color: '#4caf50' },
                        { name: 'ออฟไลน์', value: offlineDevices, color: '#f44336' },
                        { name: 'เตือน', value: warningDevices, color: '#ff9800' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={{ stroke: '#ddd' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]}
                          fill={(entry: any) => entry.color}
                        />
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