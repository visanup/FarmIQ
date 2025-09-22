import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Fade,
  Zoom,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreHoriz as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartCard } from '../dashboard/components/ChartCard'; 
import { KpiCard } from './components/KpiCard';

const AnalyticsPage: React.FC = () => {
  // Filter states
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [timeRange, setTimeRange] = useState<number>(24); // hours

  // Use custom hook for data fetching
  const { 
    data, 
    isLoading, 
    error, 
    lastUpdate, 
    refresh 
  } = useAnalyticsData({
    selectedFarm,
    selectedDevice,
    selectedMetric,
    timeRange
  });

  const {
    farms,
    devices,
    sensorReadings,
    performanceMetrics,
    fcrData,
    sizeDistribution,
    anomalySummary,
    timeSeriesData
  } = data;

  const handleRefresh = () => {
    refresh();
  };

  // Calculate statistics
  const onlineDevices = devices.filter(d => d.status === 'ONLINE').length;
  const totalReadings = sensorReadings.length;
  const avgTemperature = sensorReadings
    .filter(r => r.sensorType === 'temperature')
    .reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / 
    Math.max(sensorReadings.filter(r => r.sensorType === 'temperature').length, 1);
  
  const anomalies = sensorReadings.filter(r => 
    r.sensorType === 'temperature' && 
    typeof r.value === 'number' && 
    (r.value < 20 || r.value > 35)
  ).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="500px"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            filter: 'blur(40px)' 
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -30, 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.08)', 
            filter: 'blur(30px)' 
          }} />
          
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)'
              }}>
                <AnalyticsIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 2, 
                background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Analytics Dashboard
              </Typography>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                กำลังโหลดข้อมูล...
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <LinearProgress 
                  sx={{ 
                    width: 200, 
                    height: 8, 
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                      borderRadius: 4
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  กรุณารอสักครู่
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Premium Hero Header */}
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha('#4CAF50', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.08)} 0%, ${alpha('#2196F3', 0.05)} 100%)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              right: -60, 
              top: -60, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: `radial-gradient(circle, ${alpha('#4CAF50', 0.1)} 0%, transparent 70%)`,
              filter: 'blur(40px)'
            }} />
            <Box sx={{ 
              position: 'absolute', 
              right: 60, 
              bottom: -80, 
              width: 350, 
              height: 350, 
              borderRadius: '50%', 
              background: `radial-gradient(circle, ${alpha('#2196F3', 0.08)} 0%, transparent 70%)`,
              filter: 'blur(50px)'
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
      <Box>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  mb: 2, 
                  px: 2, 
                  py: 1, 
                  borderRadius: 999, 
                  background: `linear-gradient(135deg, #4CAF50, #45a049)`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha('#4CAF50', 0.4)}`
                }}>
                  <AnalyticsIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    Advanced Analytics
                  </Typography>
                </Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: -0.5,
                  background: `linear-gradient(135deg, #4CAF50, #2196F3)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
                  Real-time data analysis and insights from connected sensors and devices.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={handleRefresh} 
                    sx={{ 
                      border: `2px solid ${alpha('#4CAF50', 0.2)}`, 
                      bgcolor: 'background.paper',
                      boxShadow: `0 4px 12px ${alpha('#4CAF50', 0.15)}`,
                      '&:hover': {
                        bgcolor: '#4CAF50',
                        color: 'white',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Report">
                  <IconButton sx={{ 
                    border: `2px solid ${alpha('#2196F3', 0.2)}`, 
                    bgcolor: 'background.paper',
                    boxShadow: `0 4px 12px ${alpha('#2196F3', 0.15)}`,
                    '&:hover': {
                      bgcolor: '#2196F3',
                      color: 'white',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <IconButton sx={{ 
                  border: `2px solid ${alpha('#666', 0.2)}`, 
                  bgcolor: 'background.paper',
                  boxShadow: `0 4px 12px ${alpha('#666', 0.15)}`,
                  '&:hover': {
                    bgcolor: '#666',
                    color: 'white',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <MoreIcon />
                </IconButton>
              </Stack>
          </Box>
          </Card>
        </Fade>

        {/* Enhanced Control Bar */}
        <Fade in timeout={1200}>
          <Card elevation={0} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            display: 'flex', 
            gap: 3, 
            alignItems: 'center', 
            border: `1px solid ${alpha('#4CAF50', 0.2)}`, 
            backdropFilter: 'blur(20px)', 
            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8f9fa', 0.7)} 100%)`,
            boxShadow: `0 8px 32px ${alpha('#000', 0.08)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <TimelineIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Filters & Controls
              </Typography>
        </Box>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Farm Selection</InputLabel>
              <Select 
                label="Farm Selection"
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#4CAF50', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="all">All Farms ({farms.length})</MenuItem>
                {farms.map(farm => (
                  <MenuItem key={farm.id} value={farm.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon fontSize="small" color="primary" />
                      {safeRenderValue(farm.name)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Device Type</InputLabel>
              <Select 
                label="Device Type" 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#2196F3', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196F3',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196F3',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="all">All Devices ({devices.length})</MenuItem>
                <MenuItem value="sensor">Sensors</MenuItem>
                <MenuItem value="camera">Cameras</MenuItem>
                <MenuItem value="scale">Scales</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Metric Type</InputLabel>
              <Select 
                label="Metric Type" 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#FF9800', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF9800',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF9800',
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="temperature">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon fontSize="small" color="action" />
                    Temperature
                  </Box>
                </MenuItem>
                <MenuItem value="humidity">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DataUsageIcon fontSize="small" color="action" />
                    Humidity
                  </Box>
                </MenuItem>
                <MenuItem value="CO2">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" color="action" />
                    CO2 Level
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Time Range (hours)" 
              type="number" 
              size="small"
              value={timeRange} 
              onChange={(e) => setTimeRange(Math.max(1, Number(e.target.value)))} 
              inputProps={{ min: 1, max: 168 }}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Card>
        </Fade>

        {/* Key Metrics Section */}
        <Grid container spacing={4} mb={4}>
          <Grid item xs={12}>
            <Fade in timeout={1000}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'text.primary'
                }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <AssessmentIcon />
                  </Avatar>
                  Key Performance Indicators
                </Typography>
              </Box>
            </Fade>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '100ms' }}>
                  <Box>
                    <KpiCard 
                      title="Average Temperature" 
                      value={avgTemperature.toFixed(2)} 
                      unit="°C" 
                      icon={<SpeedIcon />}
                      color="#4CAF50"
                      isLoading={isLoading} 
                    />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <KpiCard 
                      title="Total Readings" 
                      value={totalReadings} 
                      icon={<DataUsageIcon />}
                      color="#2196F3"
                      isLoading={isLoading} 
                    />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
                  <Box>
                    <KpiCard 
                      title="Online Devices" 
                      value={`${onlineDevices}/${devices.length}`} 
                      icon={<CheckCircleIcon />}
                      color="#FF9800"
                      isLoading={isLoading} 
                    />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
                  <Box>
                    <KpiCard 
                      title="Anomalies Detected" 
                      value={anomalies} 
                      icon={<WarningIcon />}
                      color={anomalies > 0 ? '#F44336' : '#4CAF50'}
                      isLoading={isLoading} 
                    />
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4} mb={4}>
          <Grid item xs={12}>
            <Fade in timeout={1200}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'text.primary'
                }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    <TimelineIcon />
                  </Avatar>
                  Data Visualization & Trends
                </Typography>
              </Box>
            </Fade>
            
            <Grid container spacing={4}>
              {/* Main Chart */}
              <Grid item xs={12} lg={8}>
                <Zoom in timeout={1000} style={{ transitionDelay: '100ms' }}>
                  <Box>
                    <ChartCard 
                      title="Real-time Sensor Data" 
                      subheader={`${selectedMetric} over the last ${timeRange} hours`} 
                      loading={isLoading}
                    >
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#FF9800" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                          <Area type="monotone" dataKey="temperature" stroke="#4CAF50" fillOpacity={1} fill="url(#colorTemperature)" />
                          <Area type="monotone" dataKey="humidity" stroke="#2196F3" fillOpacity={1} fill="url(#colorHumidity)" />
                          <Area type="monotone" dataKey="co2" stroke="#FF9800" fillOpacity={1} fill="url(#colorCO2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
              
              {/* Side Charts */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
                      <Box>
                        <ChartCard title="Device Status" subheader="Online vs Offline">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Online', value: onlineDevices, color: '#4CAF50' },
                                  { name: 'Offline', value: devices.length - onlineDevices, color: '#F44336' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {[
                                  { name: 'Online', value: onlineDevices, color: '#4CAF50' },
                                  { name: 'Offline', value: devices.length - onlineDevices, color: '#F44336' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartCard>
                      </Box>
                    </Zoom>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '300ms' }}>
                      <Box>
                        <ChartCard title="Sensor Types" subheader="Data Distribution">
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                              { name: 'Temp', value: sensorReadings.filter(r => r.sensorType === 'temperature').length },
                              { name: 'Humidity', value: sensorReadings.filter(r => r.sensorType === 'humidity').length },
                              { name: 'CO2', value: sensorReadings.filter(r => r.sensorType === 'CO2').length },
                              { name: 'Others', value: sensorReadings.filter(r => !['temperature', 'humidity', 'CO2'].includes(r.sensorType)).length }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="value" fill="#4CAF50" />
                            </BarChart>
                </ResponsiveContainer>
            </ChartCard>
                      </Box>
                    </Zoom>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Anomalies Table */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Fade in timeout={1400}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'text.primary'
                }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                    <WarningIcon />
                  </Avatar>
                  Anomaly Detection & Analysis
                </Typography>
              </Box>
            </Fade>
            
            <Zoom in timeout={1400}>
              <Card elevation={0} sx={{ 
                borderRadius: 4, 
                border: `1px solid ${alpha('#FF9800', 0.2)}`,
                background: `linear-gradient(135deg, ${alpha('#FF9800', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, #FF9800, #F44336)`
                }} />
                
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                    Detected Anomalies
                  </Typography>
                  
              <TableContainer>
                <Table>
                  <TableHead>
                        <TableRow sx={{ 
                          background: `linear-gradient(135deg, ${alpha('#FF9800', 0.1)}, ${alpha('#F44336', 0.05)})`,
                          '& .MuiTableCell-head': {
                            fontWeight: 700,
                            color: 'text.primary'
                          }
                        }}>
                      <TableCell>Timestamp</TableCell>
                          <TableCell>Sensor Type</TableCell>
                      <TableCell align="right">Value</TableCell>
                          <TableCell align="right">Threshold</TableCell>
                          <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                        {sensorReadings
                          .filter(r => 
                            r.sensorType === 'temperature' && 
                            typeof r.value === 'number' && 
                            (r.value < 20 || r.value > 35)
                          )
                          .slice(0, 10)
                          .map((reading, idx) => (
                          <TableRow key={idx} hover sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: alpha('#FF9800', 0.02) 
                            },
                            '&:hover': {
                              backgroundColor: alpha('#FF9800', 0.08)
                            }
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(reading.timestamp).toLocaleString('th-TH')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={reading.sensorType} 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                {typeof reading.value === 'number' ? reading.value.toFixed(2) : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                20°C - 35°C
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={typeof reading.value === 'number' && (reading.value < 20 || reading.value > 35) ? 'Critical' : 'Normal'} 
                                size="small" 
                                color={typeof reading.value === 'number' && (reading.value < 20 || reading.value > 35) ? 'error' : 'success'}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {sensorReadings.filter(r => 
                          r.sensorType === 'temperature' && 
                          typeof r.value === 'number' && 
                          (r.value < 20 || r.value > 35)
                        ).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                                  No Anomalies Detected
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  All sensor readings are within normal parameters
                                </Typography>
                              </Box>
                            </TableCell>
                      </TableRow>
                        )}
                  </TableBody>
                </Table>
              </TableContainer>
                </Box>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
