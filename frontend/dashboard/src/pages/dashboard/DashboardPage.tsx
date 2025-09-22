import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  useTheme,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  LinearProgress,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Agriculture as FarmIcon,
  Devices as DeviceIcon,
  MonitorHeart as AnimalIcon,
  Notifications as AlertIcon,
  Event as EventIcon,
  ErrorOutline as ErrorOutlineIcon,
  Settings as SettingsIcon,
  DateRange as DateRangeIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';
import { useDashboardData } from '../../hooks/useDashboardData';

// Import Charts and Cards
import { TemperatureHumidityChart } from './components/TemperatureHumidityChart';
import { DeviceStatusChart } from './components/DeviceStatusChart';
import { ProductionChart } from './components/ProductionChart';
import { AnimalHealthChart } from './components/AnimalHealthChart';
import { ChartCard } from './components/ChartCard'; // New ChartCard
import { mockAlerts } from '../../services/api/mockData'; // Using mock data for now
import { DashboardLayout } from '../../components/layout/DashboardLayout'; // Import DashboardLayout
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshSmallIcon, MoreHoriz as MoreIcon, WorkspacePremium as PremiumIcon } from '@mui/icons-material';

// Re-styled Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trendValue?: string;
  trendDirection?: 'up' | 'down';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, trendValue, trendDirection, loading }) => {
  const theme = useTheme();
  return (
    <Fade in timeout={600}>
      <Card 
        elevation={0}
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          height: '100%', 
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette[color].main, 0.3)}`,
            borderColor: `${theme.palette[color].main}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: 0.5, 
              background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 4px ${alpha(theme.palette[color].main, 0.3)}`
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress sx={{ width: 60, height: 8, borderRadius: 4 }} />
                  <Typography variant="h6">Loading...</Typography>
                </Box>
              ) : value}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ 
            bgcolor: `${color}.main`, 
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.4)}`,
            border: `3px solid ${alpha(theme.palette[color].main, 0.1)}`
          }}>
            {icon}
          </Avatar>
        </Box>
        {trendValue && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            background: alpha(theme.palette[color].main, 0.08),
            border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`
          }}>
            {trendDirection === 'up' ? 
              <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} /> : 
              <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: '1.2rem' }} />}
            <Typography variant="body2" color={trendDirection === 'up' ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
              {trendValue}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
              vs last month
            </Typography>
          </Box>
        )}
      </Card>
    </Fade>
  );
};


const DashboardPage: React.FC = () => {
  const theme = useTheme();
  
  // Use the custom hook for data fetching
  const { 
    data, 
    isLoading, 
    error, 
    lastUpdate, 
    refresh 
  } = useDashboardData();

  // Destructure data from the hook
  const {
    farms,
    devices,
    animals,
    deviceHealth,
    sensorReadings,
    performanceMetrics,
  } = data;

  const handleRefresh = () => {
    refresh();
  };

  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const criticalAlerts = deviceHealth.filter(h => 
    h.errors && h.errors.length > 0 || h.warnings && h.warnings.some((w: string) => w.includes('Critical'))
  ).length;
  
  // Analytics insights from real data
  const latestTempReading = sensorReadings.find(r => r.sensorType === 'temperature');
  const currentTemp = latestTempReading ? latestTempReading.value : null;
  const latestKpi = performanceMetrics[0];
  
  // Generate activity feed from real data
  const generateActivityFeed = () => {
    const activities = [];
    
    // Add device health alerts
    deviceHealth.forEach(health => {
      if (health.errors && health.errors.length > 0) {
        activities.push({
          icon: <ErrorOutlineIcon color="error" />,
          text: `Device ${health.deviceId} error: ${health.errors[0]}`,
          time: health.lastSeen ? new Date(health.lastSeen).toLocaleString('th-TH') : 'Unknown',
          type: 'alert'
        });
      }
      if (health.warnings && health.warnings.length > 0) {
        activities.push({
          icon: <ErrorOutlineIcon color="warning" />,
          text: `Device ${health.deviceId} warning: ${health.warnings[0]}`,
          time: health.lastSeen ? new Date(health.lastSeen).toLocaleString('th-TH') : 'Unknown',
          type: 'alert'
        });
      }
    });
    
    // Add sensor readings alerts
    const recentReadings = sensorReadings
      .filter(r => new Date(r.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .slice(0, 3);
    
    recentReadings.forEach(reading => {
      activities.push({
        icon: <EventIcon color="info" />,
        text: `${reading.sensorType} reading: ${typeof reading.value === 'number' ? reading.value.toFixed(2) : reading.value}`,
        time: new Date(reading.timestamp).toLocaleString('th-TH'),
        type: 'event'
      });
    });
    
    // Add system events
    activities.push({
      icon: <SettingsIcon color="action" />,
      text: `Dashboard updated at ${lastUpdate.toLocaleString('th-TH')}`,
      time: 'Just now',
      type: 'system'
    });
    
    return activities.slice(0, 5); // Limit to 5 activities
  };

  const activityFeed = generateActivityFeed();

  // Show error state if there's an error
  if (error) {
    return (
      <DashboardLayout>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="500px"
          sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
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
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)'
              }}>
                <ErrorOutlineIcon sx={{ fontSize: 40 }} />
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
                เกิดข้อผิดพลาด
              </Typography>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {error}
              </Typography>
              
              <Button
                variant="contained"
                onClick={handleRefresh}
                sx={{
                  background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                  color: '#ff6b6b',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                  }
                }}
              >
                ลองใหม่
              </Button>
            </Box>
          </Fade>
        </Box>
      </DashboardLayout>
    );
  }

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
                <FarmIcon sx={{ fontSize: 40 }} />
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
                FarmIQ Dashboard
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
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              filter: 'blur(40px)'
            }} />
            <Box sx={{ 
              position: 'absolute', 
              right: 60, 
              bottom: -80, 
              width: 350, 
              height: 350, 
              borderRadius: '50%', 
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                }}>
                  <PremiumIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    Premium Dashboard
                  </Typography>
                </Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: -0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  FarmIQ Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
                  A professional overview of operations, analytics and real‑time insights.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={handleRefresh} 
                    sx={{ 
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`, 
                      bgcolor: 'background.paper',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <RefreshSmallIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Report">
                  <IconButton sx={{ 
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`, 
                    bgcolor: 'background.paper',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.main,
                      color: 'white',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <IconButton sx={{ 
                  border: `2px solid ${alpha(theme.palette.grey[500], 0.2)}`, 
                  bgcolor: 'background.paper',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.grey[500], 0.15)}`,
                  '&:hover': {
                    bgcolor: theme.palette.grey[500],
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

        {/* Premium Control Bar */}
        <Fade in timeout={1200}>
          <Card elevation={0} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            display: 'flex', 
            gap: 3, 
            alignItems: 'center', 
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, 
            backdropFilter: 'blur(20px)', 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
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
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="all">All Farms ({farms.length})</MenuItem>
                {farms.map(farm => (
                  <MenuItem key={farm.id} value={farm.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FarmIcon fontSize="small" color="primary" />
                      {safeRenderValue(farm.name)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Time Range</InputLabel>
              <Select 
                label="Time Range" 
                IconComponent={DateRangeIcon}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.secondary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.secondary.main,
                    borderWidth: 2,
                  }
                }}
              >
                <MenuItem value="24h">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon fontSize="small" color="action" />
                    Last 24 hours
                  </Box>
                </MenuItem>
                <MenuItem value="7d">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon fontSize="small" color="action" />
                    Last 7 days
                  </Box>
                </MenuItem>
                <MenuItem value="30d">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon fontSize="small" color="action" />
                    Last 30 days
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Card>
        </Fade>
        
        {/* Main Content */}
        <Grid container spacing={4}>
          
          {/* Main Metrics - Enhanced Layout */}
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
                    <MetricCard title="Total Farms" value={farms.length} icon={<FarmIcon />} color="primary" trendValue="+2" trendDirection="up" loading={isLoading} />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <MetricCard title="Total Animals" value={animals.length} icon={<AnimalIcon />} color="success" trendValue="+5%" trendDirection="up" loading={isLoading} />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
                  <Box>
                    <MetricCard title="Devices Online" value={`${onlineDevices}/${devices.length}`} icon={<DeviceIcon />} color="info" trendValue="-1" trendDirection="down" loading={isLoading} />
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
                  <Box>
                    <MetricCard title="Critical Alerts" value={criticalAlerts} icon={<AlertIcon />} color="warning" trendValue="+3" trendDirection="up" loading={isLoading} />
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>

          {/* Analytics Insights - Enhanced Layout */}
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
                    <TrendingUpIcon />
                  </Avatar>
                  Live Analytics Insights
                </Typography>
              </Box>
            </Fade>
            
            <Zoom in timeout={1400}>
              <Card elevation={0} sx={{ 
                p: 4, 
                borderRadius: 4, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '100ms' }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        borderRadius: 3,
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                        }
                      }}>
                        <Typography variant="h2" sx={{ 
                          fontWeight: 800, 
                          color: 'primary.main',
                          mb: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {currentTemp ? `${safeRenderNumber(currentTemp)}°C` : '--'}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Current Temperature
                        </Typography>
                      </Box>
                    </Zoom>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={3}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '200ms' }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        borderRadius: 3,
                        background: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.3)}`
                        }
                      }}>
                        <Typography variant="h2" sx={{ 
                          fontWeight: 800, 
                          color: 'success.main',
                          mb: 1,
                          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {latestKpi ? safeRenderNumber(latestKpi.mean_val) : '--'}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Daily Average
                        </Typography>
                      </Box>
                    </Zoom>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={3}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '300ms' }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        borderRadius: 3,
                        background: alpha(theme.palette.warning.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.warning.main, 0.3)}`
                        }
                      }}>
                        <Typography variant="h2" sx={{ 
                          fontWeight: 800, 
                          color: 'warning.main',
                          mb: 1,
                          background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {latestKpi ? safeRenderNumber(latestKpi.stddev_val) : '--'}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Variability
                        </Typography>
                      </Box>
                    </Zoom>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={3}>
                    <Zoom in timeout={1000} style={{ transitionDelay: '400ms' }}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        borderRadius: 3,
                        background: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.info.main, 0.3)}`
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          {performanceMetrics.length > 0 ? (
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                          ) : (
                            <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                          )}
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Analytics Status
                        </Typography>
                      </Box>
                    </Zoom>
                  </Grid>
                </Grid>
              </Card>
            </Zoom>
          </Grid>

          {/* Charts Section - Enhanced Layout */}
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
                  <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                    <TimelineIcon />
                  </Avatar>
                  Data Visualization & Analytics
                </Typography>
              </Box>
            </Fade>
            
            <Grid container spacing={4}>
              {/* Top Row Charts */}
              <Grid item xs={12} lg={8}>
                <Zoom in timeout={1200} style={{ transitionDelay: '100ms' }}>
                  <Box>
                    <ChartCard title="Environment Analytics" subheader="Temperature & Humidity Overview">
                      <TemperatureHumidityChart />
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Zoom in timeout={1200} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <ChartCard title="Device Status" subheader="Online vs. Offline">
                      <DeviceStatusChart />
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
              
              {/* Middle Row Charts */}
              <Grid item xs={12} lg={8}>
                <Zoom in timeout={1200} style={{ transitionDelay: '300ms' }}>
                  <Box>
                    <ChartCard title="Production Overview" subheader="Key Performance Indicators">
                      <ProductionChart />
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Zoom in timeout={1200} style={{ transitionDelay: '400ms' }}>
                  <Box>
                    <ChartCard title="Animal Health" subheader="Health Status Distribution">
                      <AnimalHealthChart />
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
              
              {/* Full Width Chart */}
              <Grid item xs={12}>
                <Zoom in timeout={1200} style={{ transitionDelay: '500ms' }}>
                  <Box>
                    <ChartCard title="Real-time Sensor Data" subheader="Temperature (last 24 hours)">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={sensorReadings
                            .filter(r => r.sensorType === 'temperature')
                            .slice(-24)
                            .map(d => ({ 
                              time: new Date(d.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), 
                              value: typeof d.value === 'number' ? d.value : 0 
                            }))}
                          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" strokeWidth={2} stroke={'var(--mui-palette-primary-main)'} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Activity Feed - Enhanced Layout */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={1600}>
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
                    <EventIcon />
                  </Avatar>
                  Recent Activity Feed
                </Typography>
              </Box>
            </Fade>
            
            <Zoom in timeout={1600}>
              <Card elevation={0} sx={{ 
                p: 3, 
                borderRadius: 4, 
                height: '100%', 
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
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
                  background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`
                }} />
                
                <List disablePadding>
                  {activityFeed.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        mb: 2,
                        transition: 'all 0.3s ease',
                        background: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateX(8px) scale(1.02)',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                        }
                      }}>
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: item.type === 'alert' ? 'error.main' : item.type === 'event' ? 'info.main' : 'grey.500',
                            boxShadow: `0 6px 16px ${alpha(item.type === 'alert' ? theme.palette.error.main : item.type === 'event' ? theme.palette.info.main : theme.palette.grey[500], 0.4)}`
                          }}>
                            {item.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                              {item.text}
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                              {item.time}
                            </Typography>
                          } 
                        />
                        <Chip 
                          label={item.type} 
                          size="small" 
                          color={item.type === 'alert' ? 'error' : item.type === 'event' ? 'info' : 'default'} 
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 28,
                            borderRadius: 14,
                            minWidth: 60,
                            textAlign: 'center'
                          }} 
                        />
                      </ListItem>
                      {index < activityFeed.length - 1 && (
                        <Divider 
                          variant="inset" 
                          component="li" 
                          sx={{ 
                            mx: 3,
                            borderColor: alpha(theme.palette.divider, 0.3)
                          }} 
                        />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Zoom>
          </Grid>

        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;