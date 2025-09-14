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
} from '@mui/icons-material';
import { useFarms, useDevices, useAnimals, useDeviceHealth } from '../../hooks/useApi';
import { useAgg, useKpi, useAnalyticsHealth } from '../../hooks/useAnalytics';

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
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%', 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        background: theme.palette.mode === 'light'
          ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette[color].lighter}14 100%)`
          : `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, ${theme.palette[color].dark}10 100%)`,
        transition: 'all 0.25s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 32px ${theme.palette[color].main}25`,
            borderColor: `${theme.palette[color].main}44`,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{loading ? '...' : value}</Typography>
            <Typography variant="body1" color="text.secondary">{title}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>{icon}</Avatar>
      </Box>
      {trendValue && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          {trendDirection === 'up' ? 
            <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: '1rem' }} /> : 
            <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: '1rem' }} />}
          <Typography variant="caption" color={trendDirection === 'up' ? 'success.main' : 'error.main'} sx={{ fontWeight: 'medium' }}>
            {trendValue}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>vs last month</Typography>
        </Box>
      )}
    </Paper>
  );
};


const DashboardPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: deviceHealth = [], isLoading: healthLoading } = useDeviceHealth();
  
  // Analytics data
  const { data: analyticsHealth } = useAnalyticsHealth();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const { data: temperatureData = [] } = useAgg({
    tenant_id: 'tenant-a',
    factory_id: 'factory-1',
    machine_id: 'machine-1',
    metric: 'temperature',
    window_s: 300, // 5 minutes
    start: oneHourAgo.toISOString(),
    end: now.toISOString(),
    limit: 12,
  }, true);
  
  const { data: kpiData = [] } = useKpi({
    tenant_id: 'tenant-a',
    factory_id: 'factory-1',
    machine_id: 'machine-1',
    metric: 'temperature',
    period: 'day',
    limit: 1,
  }, true);
  
  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const onlineDevices = deviceHealth.filter(h => h.status === 'ONLINE').length;
  const criticalAlerts = mockAlerts.filter(alert => alert.severity === 'critical').length;
  
  // Analytics insights
  const latestKpi = kpiData[0];
  const currentTemp = temperatureData.length > 0 ? temperatureData[temperatureData.length - 1]?.avg_val : null;
  
  const activityFeed = [
    { icon: <ErrorOutlineIcon color="error" />, text: "Sensor #102 temp. anomaly", time: "2m ago", type: 'alert' },
    { icon: <EventIcon color="info" />, text: "System maintenance scheduled", time: "1h ago", type: 'event' },
    { icon: <SettingsIcon color="action" />, text: "Device #55 firmware updated", time: "3h ago", type: 'system' },
    { icon: <ErrorOutlineIcon color="warning" />, text: "High humidity warning in Barn-03", time: "5h ago", type: 'alert' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Premium Hero Header */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            border: theme => `1px solid ${theme.palette.divider}`,
            background: theme => `linear-gradient(135deg, ${theme.palette.primary.light}10, transparent)`,
          }}
        >
          <Box sx={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.06 }} />
          <Box sx={{ position: 'absolute', right: 40, bottom: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'secondary.main', opacity: 0.04 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <Box>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <PremiumIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>Premium Dashboard</Typography>
              </Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                FarmIQ™ Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                A professional overview of operations, analytics and real‑time insights.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.25}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} color="primary" sx={{ border: theme => `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                  <RefreshSmallIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton color="inherit" sx={{ border: theme => `1px solid ${theme.palette.divider}` }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <IconButton color="inherit" sx={{ border: theme => `1px solid ${theme.palette.divider}` }}>
                <MoreIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Premium Control Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 4, display: 'flex', gap: 2, alignItems: 'center', border: `1px solid ${theme.palette.divider}`, backdropFilter: 'blur(6px)', background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)' }}>
            <FormControl size="small" sx={{minWidth: 180}}>
              <InputLabel>All Farms</InputLabel>
              <Select label="All Farms">
                  <MenuItem value="all">All Farms</MenuItem>
                  {farms.map(farm => <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{minWidth: 180}}>
              <InputLabel>Date Range</InputLabel>
              <Select label="Date Range" IconComponent={DateRangeIcon}>
                  <MenuItem value="24h">Last 24 hours</MenuItem>
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
              </Select>
            </FormControl>
        </Paper>
        
        {/* Main Content */}
        <Grid container spacing={3}>
          
          {/* Main Metrics */}
          <Grid item xs={12} lg={9}>
              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                      <MetricCard title="Total Farms" value={farms.length} icon={<FarmIcon />} color="primary" trendValue="+2" trendDirection="up" loading={farmsLoading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <MetricCard title="Total Animals" value={animals.length} icon={<AnimalIcon />} color="success" trendValue="+5%" trendDirection="up" loading={animalsLoading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <MetricCard title="Devices Online" value={`${onlineDevices}/${devices.length}`} icon={<DeviceIcon />} color="info" trendValue="-1" trendDirection="down" loading={devicesLoading || healthLoading} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <MetricCard title="Critical Alerts" value={criticalAlerts} icon={<AlertIcon />} color="warning" trendValue="+3" trendDirection="up" loading={false} />
                  </Grid>

                  {/* Analytics Insights */}
                  {analyticsHealth && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, background: theme => `linear-gradient(135deg, ${theme.palette.primary.light}08 0%, ${theme.palette.background.paper} 60%)` }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUpIcon color="primary" />
                          Live Analytics Insights
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {currentTemp ? `${currentTemp.toFixed(1)}°C` : '--'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">Current Temperature</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                {latestKpi ? latestKpi.mean_val.toFixed(1) : '--'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">Daily Average</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                {latestKpi ? latestKpi.stddev_val.toFixed(2) : '--'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">Variability</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                                {analyticsHealth.status === 'healthy' ? '✓' : '⚠'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">Analytics Status</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {/* Main Charts */}
                  <Grid item xs={12} md={8}>
                    <ChartCard title="Environment Analytics" subheader="Temperature & Humidity Overview">
                        <TemperatureHumidityChart />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ChartCard title="Device Status" subheader="Online vs. Offline">
                        <DeviceStatusChart />
                    </ChartCard>
                  </Grid>
                   <Grid item xs={12} md={8}>
                    <ChartCard title="Production Overview" subheader="Key Performance Indicators">
                        <ProductionChart />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ChartCard title="Animal Health" subheader="Health Status Distribution">
                        <AnimalHealthChart />
                    </ChartCard>
                  </Grid>
                  <Grid item xs={12}>
                    <ChartCard title="Cloud Analytics Trend" subheader="Temperature (last 60 minutes, 5m buckets)">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={temperatureData.map(d => ({ time: new Date(d.bucket_start).toLocaleTimeString(), value: d.avg_val }))}
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
                  </Grid>
              </Grid>
          </Grid>
          
          {/* Right Sidebar / Activity Feed */}
          <Grid item xs={12} lg={3}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 4, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, p: 1 }}>Recent Activity</Typography>
                  <List disablePadding>
                      {activityFeed.map((item, index) => (
                          <React.Fragment key={index}>
                              <ListItem>
                                  <ListItemIcon sx={{minWidth: 36}}>{item.icon}</ListItemIcon>
                                  <ListItemText primary={item.text} secondary={item.time} />
                                  <Chip label={item.type} size="small" color={item.type === 'alert' ? 'error' : item.type === 'event' ? 'info' : 'default'} variant="outlined" />
                              </ListItem>
                              {index < activityFeed.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                      ))}
                  </List>
              </Paper>
          </Grid>

        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;