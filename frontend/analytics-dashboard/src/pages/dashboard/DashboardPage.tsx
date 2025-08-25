import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Chip,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Fab,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Devices,
  Warning,
  CheckCircle,
  TrendingDown,
  Refresh,
  Dashboard,
  Agriculture,
  ViewModule,
  Psychology,
  MonitorHeart,
  Sensors
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';

// Import contexts and services
import { useDashboard, DashboardProvider } from '../../contexts/DashboardContext';
import { performanceService } from '../../services/performance';
import { animalWeightService } from '../../services/weight';
import { sensorDataService } from '../../services/sensors';

// Import chart components
import { PerformanceChart, AnimalWeightChart, SensorDataChart } from '../../components/charts';

// Import types
import type { 
  PerformanceTimeSeriesData, 
  WeightTimeSeriesData, 
  WeightGrowthAnalysis,
  SensorTimeSeriesData,
  ComprehensiveSensorData 
} from '../../services/performance/performanceService';

// Enhanced MetricCard with better responsive design
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                color="textSecondary" 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  mb: 1
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant={isMobile ? "h5" : "h4"}
                component="div" 
                sx={{ 
                  color, 
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {/* Icon */}
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          {/* Trend */}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                size={isMobile ? "small" : "medium"}
                icon={trend === 'up' ? <TrendingUp /> : trend === 'down' ? <TrendingDown /> : undefined}
                label={trend === 'up' ? 'เพิ่มขึ้น' : trend === 'down' ? 'ลดลง' : 'คงที่'}
                color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Level Selection Component
const LevelSelector: React.FC = () => {
  const { state, setLevel, getAvailableFarms, getAvailablePens } = useDashboard();
  
  const availableFarms = getAvailableFarms();
  const availablePens = getAvailablePens();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        🎯 เลือกระดับการแสดงผล
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <ButtonGroup variant="outlined" fullWidth>
            <Button
              variant={state.filters.level === 'overview' ? 'contained' : 'outlined'}
              onClick={() => setLevel('overview')}
              startIcon={<Dashboard />}
            >
              ภาพรวม
            </Button>
            <Button
              variant={state.filters.level === 'farm' ? 'contained' : 'outlined'}
              onClick={() => setLevel('farm')}
              startIcon={<Agriculture />}
              disabled={availableFarms.length === 0}
            >
              ฟาร์ม
            </Button>
            <Button
              variant={state.filters.level === 'pen' ? 'contained' : 'outlined'}
              onClick={() => setLevel('pen')}
              startIcon={<ViewModule />}
              disabled={availablePens.length === 0}
            >
              เล้า
            </Button>
          </ButtonGroup>
        </Grid>
        
        {state.filters.level !== 'overview' && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>เลือกฟาร์ม</InputLabel>
              <Select
                value={state.filters.farmId || ''}
                label="เลือกฟาร์ม"
                onChange={(e) => setLevel('farm', e.target.value)}
              >
                {availableFarms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.name} ({farm.penCount} เล้า)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        {state.filters.level === 'pen' && state.filters.farmId && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>เลือกเล้า</InputLabel>
              <Select
                value={state.filters.penId || ''}
                label="เลือกเล้า"
                onChange={(e) => setLevel('pen', state.filters.farmId, e.target.value)}
              >
                {availablePens.map((pen) => (
                  <MenuItem key={pen.id} value={pen.id}>
                    {pen.name} ({pen.currentStock}/{pen.capacity} ตัว)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

// Main Dashboard Content Component
const DashboardContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, refreshData, setLoading, setError } = useDashboard();
  
  // State for data and UI
  const [activeTab, setActiveTab] = useState(0);
  const [performanceData, setPerformanceData] = useState<PerformanceTimeSeriesData | null>(null);
  const [weightData, setWeightData] = useState<WeightTimeSeriesData | null>(null);
  const [weightAnalysis, setWeightAnalysis] = useState<WeightGrowthAnalysis | null>(null);
  const [sensorData, setSensorData] = useState<SensorTimeSeriesData | null>(null);
  const [realTimeSensorData, setRealTimeSensorData] = useState<ComprehensiveSensorData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load performance data
  const loadPerformanceData = async () => {
    if (!state.currentCustomer && !state.isAdmin) return;
    
    setLoading('performance', true);
    setError('performance', null);
    
    try {
      const data = await performanceService.getPerformanceMetrics({
        customerId: state.filters.customerId,
        farmId: state.filters.farmId,
        penId: state.filters.penId,
        level: state.filters.level,
        dateRange: state.filters.dateRange
      });
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setError('performance', 'ไม่สามารถโหลดข้อมูลประสิทธิภาพได้');
    } finally {
      setLoading('performance', false);
    }
  };

  // Load weight data
  const loadWeightData = async () => {
    if (!state.currentCustomer && !state.isAdmin) return;
    
    setLoading('weight', true);
    setError('weight', null);
    
    try {
      const [weightTimeSeriesData, analysisData] = await Promise.all([
        animalWeightService.getWeightMeasurements({
          customerId: state.filters.customerId,
          farmId: state.filters.farmId,
          penId: state.filters.penId,
          level: state.filters.level,
          dateRange: state.filters.dateRange
        }),
        animalWeightService.getWeightGrowthAnalysis({
          customerId: state.filters.customerId,
          farmId: state.filters.farmId,
          penId: state.filters.penId,
          level: state.filters.level,
          dateRange: state.filters.dateRange
        })
      ]);
      
      setWeightData(weightTimeSeriesData);
      setWeightAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading weight data:', error);
      setError('weight', 'ไม่สามารถโหลดข้อมูลน้ำหนักได้');
    } finally {
      setLoading('weight', false);
    }
  };

  // Load sensor data
  const loadSensorData = async () => {
    if (!state.currentCustomer && !state.isAdmin) return;
    
    setLoading('sensors', true);
    setError('sensors', null);
    
    try {
      const [timeSeriesData, realTimeData] = await Promise.all([
        sensorDataService.getSensorData({
          customerId: state.filters.customerId,
          farmId: state.filters.farmId,
          penId: state.filters.penId,
          level: state.filters.level,
          dateRange: state.filters.dateRange,
          interval: state.filters.interval
        }),
        sensorDataService.getRealTimeSensorStatus({
          customerId: state.filters.customerId,
          farmId: state.filters.farmId,
          penId: state.filters.penId,
          level: state.filters.level
        })
      ]);
      
      setSensorData(timeSeriesData);
      setRealTimeSensorData(realTimeData);
    } catch (error) {
      console.error('Error loading sensor data:', error);
      setError('sensors', 'ไม่สามารถโหลดข้อมูลเซ็นเซอร์ได้');
    } finally {
      setLoading('sensors', false);
    }
  };

  // Load all data
  const loadAllData = async () => {
    await Promise.all([
      loadPerformanceData(),
      loadWeightData(),
      loadSensorData()
    ]);
    refreshData();
  };

  // Auto refresh effect
  useEffect(() => {
    loadAllData();
  }, [state.filters, state.currentCustomer]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadSensorData(); // Only refresh sensor data for real-time updates
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, state.filters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    loadAllData();
  };

  // Customer info display
  const currentLevelText = () => {
    if (state.filters.level === 'overview') return 'ภาพรวมทั้งหมด';
    if (state.filters.level === 'farm') {
      const farm = state.farms.find(f => f.id === state.filters.farmId);
      return `ฟาร์ม: ${farm?.name || 'ไม่ระบุ'}`;
    }
    if (state.filters.level === 'pen') {
      const pen = state.pens.find(p => p.id === state.filters.penId);
      return `เล้า: ${pen?.name || 'ไม่ระบุ'}`;
    }
    return '';
  };

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              📊 Dashboard FarmIQ Analytics
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {state.currentCustomer && (
                <Chip 
                  label={`ลูกค้า: ${state.currentCustomer.name}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              {state.isAdmin && (
                <Chip 
                  label="ผู้ดูแลระบบ"
                  color="warning"
                  variant="filled"
                  size="small"
                />
              )}
              <Chip 
                label={currentLevelText()}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="รีเฟรชข้อมูล">
              <Button
                variant="outlined"
                onClick={handleRefresh}
                startIcon={<Refresh />}
                disabled={state.loading.performance || state.loading.weight || state.loading.sensors}
              >
                {isMobile ? '' : 'รีเฟรช'}
              </Button>
            </Tooltip>
            
            <Button
              variant={autoRefresh ? 'contained' : 'outlined'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              color={autoRefresh ? 'success' : 'inherit'}
              size="small"
            >
              {autoRefresh ? '🟢' : '🔴'} {isMobile ? '' : 'Auto'}
            </Button>
          </Stack>
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          ติดตามและวิเคราะห์ข้อมูลฟาร์มแบบเรียลไทม์ - อัปเดตล่าสุด: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </Typography>
      </Box>
      
      {/* Level Selector */}
      <LevelSelector />
      
      {/* Error Alerts */}
      {(state.errors.performance || state.errors.weight || state.errors.sensors) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>เกิดข้อผิดพลาดในการโหลดข้อมูล</AlertTitle>
          {state.errors.performance && <div>ประสิทธิภาพ: {state.errors.performance}</div>}
          {state.errors.weight && <div>น้ำหนัก: {state.errors.weight}</div>}
          {state.errors.sensors && <div>เซ็นเซอร์: {state.errors.sensors}</div>}
        </Alert>
      )}

      {/* Quick Status Cards */}
      {realTimeSensorData && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <MetricCard
              title="อุณหภูมิปัจจุบัน"
              value={`${realTimeSensorData.environment.temperature}°C`}
              icon={<Devices />}
              color={realTimeSensorData.environment.alerts.some(a => a.type === 'temperature') ? theme.palette.warning.main : theme.palette.success.main}
              trend={realTimeSensorData.environment.temperature > 30 ? "up" : "stable"}
              subtitle="สิ่งแวดล้อม"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              title="คุณภาพน้ำ"
              value={`${realTimeSensorData.waterQuality.qualityIndex}%`}
              icon={<CheckCircle />}
              color={realTimeSensorData.waterQuality.qualityIndex > 80 ? theme.palette.success.main : theme.palette.warning.main}
              trend={realTimeSensorData.waterQuality.qualityIndex > 80 ? "up" : "down"}
              subtitle={`pH ${realTimeSensorData.waterQuality.ph}`}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              title="การแจ้งเตือน"
              value={realTimeSensorData.environment.alerts.length + realTimeSensorData.waterQuality.alerts.length + realTimeSensorData.housingConditions.alerts.length}
              icon={<Warning />}
              color={theme.palette.warning.main}
              trend="down"
              subtitle="รายการที่ต้องแก้ไข"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard
              title="สถานะรวม"
              value={realTimeSensorData.overallStatus === 'excellent' ? 'ดีเยี่ยม' : 
                     realTimeSensorData.overallStatus === 'good' ? 'ดี' :
                     realTimeSensorData.overallStatus === 'fair' ? 'พอใช้' : 'ต้องปรับปรุง'}
              icon={<TrendingUp />}
              color={realTimeSensorData.overallStatus === 'excellent' || realTimeSensorData.overallStatus === 'good' ? 
                     theme.palette.success.main : theme.palette.warning.main}
              trend="up"
              subtitle="ประสิทธิภาพโดยรวม"
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology />
                  ประสิทธิภาพ
                  {state.loading.performance && <CircularProgress size={16} />}
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonitorHeart />
                  น้ำหนักสัตว์
                  {state.loading.weight && <CircularProgress size={16} />}
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sensors />
                  เซ็นเซอร์
                  {state.loading.sensors && <CircularProgress size={16} />}
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Performance Tab */}
        <TabPanel value={activeTab} index={0}>
          {state.loading.performance ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>กำลังโหลดข้อมูลประสิทธิภาพ...</Typography>
            </Box>
          ) : performanceData ? (
            <PerformanceChart 
              data={performanceData}
              title={`ตัวชี้วัดประสิทธิภาพ - ${currentLevelText()}`}
              showSummary={true}
            />
          ) : (
            <Alert severity="info">
              <AlertTitle>ไม่พบข้อมูลประสิทธิภาพ</AlertTitle>
              กรุณาตรวจสอบการตั้งค่าและลองใหม่อีกครั้ง
            </Alert>
          )}
        </TabPanel>

        {/* Weight Tab */}
        <TabPanel value={activeTab} index={1}>
          {state.loading.weight ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>กำลังโหลดข้อมูลน้ำหนัก...</Typography>
            </Box>
          ) : weightData ? (
            <AnimalWeightChart 
              data={weightData}
              analysis={weightAnalysis || undefined}
              title={`การเจริญเติบโตของสัตว์ - ${currentLevelText()}`}
              showProjections={true}
              showDistribution={false}
            />
          ) : (
            <Alert severity="info">
              <AlertTitle>ไม่พบข้อมูลน้ำหนัก</AlertTitle>
              กรุณาตรวจสอบการตั้งค่าและลองใหม่อีกครั้ง
            </Alert>
          )}
        </TabPanel>

        {/* Sensor Tab */}
        <TabPanel value={activeTab} index={2}>
          {state.loading.sensors ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>กำลังโหลดข้อมูลเซ็นเซอร์...</Typography>
            </Box>
          ) : sensorData ? (
            <SensorDataChart 
              data={sensorData}
              realTimeData={realTimeSensorData || undefined}
              title={`ข้อมูลเซ็นเซอร์ - ${currentLevelText()}`}
              showRealTime={true}
              showAlerts={true}
            />
          ) : (
            <Alert severity="info">
              <AlertTitle>ไม่พบข้อมูลเซ็นเซอร์</AlertTitle>
              กรุณาตรวจสอบการเชื่อมต่อของเซ็นเซอร์
            </Alert>
          )}
        </TabPanel>
      </Paper>
      
      {/* Floating Action Button for Quick Refresh */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={handleRefresh}
        disabled={state.loading.performance || state.loading.weight || state.loading.sensors}
      >
        <Refresh />
      </Fab>
    </Container>
  );
};

// Main Dashboard Page Component
const DashboardPage: React.FC = () => {
  return <DashboardContent />;
};

export default DashboardPage;