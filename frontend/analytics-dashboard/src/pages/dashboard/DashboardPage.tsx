import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  Badge,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Agriculture as FarmIcon,
  Devices as DeviceIcon,
  MonitorHeart as AnimalIcon,
  Sensors as SensorIcon,
  Assessment as AnalyticsIcon,
  Notifications as AlertIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as TemperatureIcon,
  Air as AirIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { format, subDays, subHours } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useFarms, useDevices, useAnimals, useDeviceHealth, useDashboardSummary } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { mockAlerts } from '../../services/api/mockData';
import { TemperatureHumidityChart } from './components/TemperatureHumidityChart';
import { DeviceStatusChart } from './components/DeviceStatusChart';
import { ProductionChart } from './components/ProductionChart';
import { AnimalHealthChart } from './components/AnimalHealthChart';

// Enhanced Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
  chart?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  loading = false,
  chart,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Card sx={{ height: '100%', p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
          <CircularProgress size={60} />
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '320px',
        background: `linear-gradient(135deg, ${theme.palette[color].main}15, ${theme.palette[color].main}05)`,
        border: `2px solid ${theme.palette[color].main}30`,
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 4px 20px ${theme.palette[color].main}15`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 40px ${theme.palette[color].main}25`,
        },
      }}
    >
      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexGrow: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette[color].main,
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                lineHeight: 1.1
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                  fontWeight: 500
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette[color].main,
              width: { xs: 64, sm: 72, md: 80 },
              height: { xs: 64, sm: 72, md: 80 },
              ml: 2,
              boxShadow: `0 4px 16px ${theme.palette[color].main}30`
            }}
          >
            {React.cloneElement(icon, { 
              sx: { fontSize: { xs: 32, sm: 36, md: 40 } } 
            })}
          </Avatar>
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            {trend.isPositive ? (
              <TrendingUpIcon color="success" sx={{ fontSize: 24, mr: 1 }} />
            ) : (
              <TrendingDownIcon color="error" sx={{ fontSize: 24, mr: 1 }} />
            )}
            <Typography 
              variant="body1" 
              color={trend.isPositive ? 'success.dark' : 'error.dark'}
              fontWeight="600"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {trend.value}% จากเดือนที่แล้ว
            </Typography>
          </Box>
        )}

        {chart && (
          <Box sx={{ mt: 3, height: 80 }}>
            {chart}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: deviceHealth = [], isLoading: healthLoading } = useDeviceHealth();
  const { data: dashboardSummary, isLoading: summaryLoading } = useDashboardSummary();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Auto refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const offlineDevices = deviceHealth.filter(h => h.status === 'OFFLINE').length;
  const criticalAlerts = mockAlerts.filter(alert => alert.severity === 'critical').length;

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.2
                }}
              >
                ภาพรวมระบบ
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                  fontWeight: 400
                }}
              >
                ข้อมูลเรียลไทม์และการวิเคราะห์ฟาร์ม
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                }
              }}
            >
              รีเฟรช
            </Button>
          </Box>
        </Box>

        {/* Critical Alerts */}
        {criticalAlerts > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              py: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              การแจ้งเตือนสำคัญ
            </AlertTitle>
            มีการแจ้งเตือนสำคัญ {criticalAlerts} รายการที่ต้องดำเนินการ
          </Alert>
        )}

        {/* Main Metrics Grid */}
        <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="ฟาร์มทั้งหมด"
              value={farms.length}
              icon={<FarmIcon />}
              color="primary"
              trend={{ value: 12, isPositive: true }}
              subtitle="6 ฟาร์มที่ใช้งาน"
              loading={farmsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="สัตว์ทั้งหมด"
              value={animals.length}
              icon={<AnimalIcon />}
              color="success"
              trend={{ value: 8, isPositive: true }}
              subtitle="สุขภาพดี 95%"
              loading={animalsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="อุปกรณ์ออนไลน์"
              value={`${onlineDevices}/${devices.length}`}
              icon={<DeviceIcon />}
              color="info"
              trend={{ value: 5, isPositive: true }}
              subtitle={`${Math.round((onlineDevices / devices.length) * 100)}% ใช้งานได้`}
              loading={devicesLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="การแจ้งเตือน"
              value={mockAlerts.length}
              icon={<AlertIcon />}
              color="warning"
              trend={{ value: -15, isPositive: false }}
              subtitle={`${criticalAlerts} รายการสำคัญ`}
              loading={false}
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: 6 }}>
          {/* Temperature & Humidity Chart */}
          <Grid item xs={12} lg={8} sx={{ height: { xs: 400, lg: 500 } }}>
            <TemperatureHumidityChart />
          </Grid>

          {/* Device Status Chart */}
          <Grid item xs={12} lg={4}>
            <DeviceStatusChart />
          </Grid>
        </Grid>

        {/* Second Row Charts */}
        <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: 6 }}>
          {/* Production Chart */}
          <Grid item xs={12} lg={8} sx={{ height: { xs: 400, lg: 500 } }}>
            <ProductionChart />
          </Grid>

          {/* Animal Health Chart */}
          <Grid item xs={12} lg={4}>
            <AnimalHealthChart />
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;