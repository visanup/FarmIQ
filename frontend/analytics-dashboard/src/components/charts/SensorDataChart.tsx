// Comprehensive Sensor Data Visualization Component
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  Thermostat,
  WaterDrop,
  Air,
  Lightbulb,
  Warning,
  CheckCircle,
  Error,
  Home,
  Opacity,
  Science,
  Schedule
} from '@mui/icons-material';

// Import sensor data types
import { 
  SensorTimeSeriesData, 
  ComprehensiveSensorData,
  EnvironmentSensorData,
  WaterQualitySensorData,
  HousingConditionsSensorData
} from '../../services/sensors/sensorDataService';

interface SensorDataChartProps {
  data: SensorTimeSeriesData;
  realTimeData?: ComprehensiveSensorData;
  title?: string;
  height?: number;
  showRealTime?: boolean;
  showAlerts?: boolean;
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Custom Tooltip
const SensorTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 3,
          maxWidth: 300
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          เวลา: {format(parseISO(label), 'dd/MM/yyyy HH:mm')}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography 
            key={index}
            variant="body2" 
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
            {entry.dataKey === 'temperature' || entry.dataKey === 'waterTemp' ? '°C' :
             entry.dataKey === 'humidity' ? '%' :
             entry.dataKey === 'co2' || entry.dataKey === 'nh3' || entry.dataKey === 'vocs' || entry.dataKey === 'tds' ? ' ppm' :
             entry.dataKey === 'illuminance' ? ' lux' :
             entry.dataKey === 'ph' ? '' :
             entry.dataKey === 'ec' ? ' µS/cm' :
             entry.dataKey === 'volume' ? ' L' :
             entry.dataKey === 'dissolvedOxygen' || entry.dataKey === 'ammonia' || entry.dataKey === 'nitrite' || entry.dataKey === 'nitrate' ? ' mg/L' :
             entry.dataKey === 'stockingDensity' ? ' ตัว/m³' :
             entry.dataKey === 'ventilationRate' ? ' ครั้ง/ชม' :
             entry.dataKey === 'airFlowRate' ? ' m³/ชม' :
             entry.dataKey.includes('Rate') || entry.dataKey.includes('Quality') || entry.dataKey.includes('Index') || entry.dataKey.includes('Utilization') || entry.dataKey.includes('Uniformity') ? '%' : ''}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Real-time Status Card
const RealTimeStatusCard: React.FC<{
  title: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
  target?: { min: number; max: number };
}> = ({ title, value, unit, status, icon, target }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      default: return theme.palette.success.main;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'critical': return <Error sx={{ fontSize: 16 }} />;
      case 'warning': return <Warning sx={{ fontSize: 16 }} />;
      default: return <CheckCircle sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Card sx={{ 
      height: '100%',
      border: `2px solid ${getStatusColor()}`,
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Box sx={{ color: getStatusColor() }}>{icon}</Box>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, color: getStatusColor() }}>
            {value} {unit}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getStatusIcon()}
            <Typography variant="caption" sx={{ color: getStatusColor(), fontWeight: 600 }}>
              {status === 'critical' ? 'วิกฤต' : status === 'warning' ? 'เตือน' : 'ปกติ'}
            </Typography>
          </Box>

          {target && (
            <Typography variant="caption" color="text.secondary">
              เป้าหมาย: {target.min}-{target.max} {unit}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Environment Chart Component
const EnvironmentChart: React.FC<{ data: EnvironmentSensorData[] }> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    timestamp: item.timestamp,
    temperature: item.temperature,
    humidity: item.humidity,
    co2: item.co2,
    nh3: item.nh3,
    vocs: item.vocs,
    illuminance: item.illuminance
  }));

  return (
    <Box>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => format(parseISO(timestamp), 'HH:mm')}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            yAxisId="temp-humid"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'อุณหภูมิ/ความชื้น', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="gas"
            orientation="right"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'ก๊าซ (ppm)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<SensorTooltip />} />
          <Legend />
          
          <Line
            yAxisId="temp-humid"
            type="monotone"
            dataKey="temperature"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            name="อุณหภูมิ (°C)"
          />
          <Line
            yAxisId="temp-humid"
            type="monotone"
            dataKey="humidity"
            stroke={theme.palette.info.main}
            strokeWidth={2}
            name="ความชื้น (%)"
          />
          <Line
            yAxisId="gas"
            type="monotone"
            dataKey="co2"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            name="CO₂ (ppm)"
          />
          <Line
            yAxisId="gas"
            type="monotone"
            dataKey="nh3"
            stroke={theme.palette.secondary.main}
            strokeWidth={2}
            name="NH₃ (ppm)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Water Quality Chart Component
const WaterQualityChart: React.FC<{ data: WaterQualitySensorData[] }> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    timestamp: item.timestamp,
    ph: item.ph,
    waterTemp: item.waterTemp,
    dissolvedOxygen: item.dissolvedOxygen,
    ammonia: item.ammonia,
    qualityIndex: item.qualityIndex,
    volume: item.volume
  }));

  return (
    <Box>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => format(parseISO(timestamp), 'HH:mm')}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            yAxisId="main"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'ค่าหลัก', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="index"
            orientation="right"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'ดัชนีคุณภาพ (%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<SensorTooltip />} />
          <Legend />
          
          <Line
            yAxisId="main"
            type="monotone"
            dataKey="ph"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            name="pH"
          />
          <Line
            yAxisId="main"
            type="monotone"
            dataKey="waterTemp"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            name="อุณหภูมิน้ำ (°C)"
          />
          <Line
            yAxisId="main"
            type="monotone"
            dataKey="dissolvedOxygen"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            name="ออกซิเจน (mg/L)"
          />
          <Area
            yAxisId="index"
            type="monotone"
            dataKey="qualityIndex"
            stroke={theme.palette.info.main}
            fill={theme.palette.info.light}
            fillOpacity={0.3}
            name="ดัชนีคุณภาพ (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Housing Conditions Chart Component
const HousingConditionsChart: React.FC<{ data: HousingConditionsSensorData[] }> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    timestamp: item.timestamp,
    stockingDensity: item.stockingDensity,
    ventilationRate: item.ventilationRate,
    beddingQuality: item.beddingQuality,
    comfortIndex: item.comfortIndex,
    spaceUtilization: item.spaceUtilization
  }));

  return (
    <Box>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => format(parseISO(timestamp), 'HH:mm')}
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            yAxisId="density"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'ความหนาแน่น', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="percent"
            orientation="right"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            label={{ value: 'เปอร์เซ็นต์', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<SensorTooltip />} />
          <Legend />
          
          <Bar
            yAxisId="density"
            dataKey="stockingDensity"
            fill={theme.palette.primary.main}
            name="ความหนาแน่น (ตัว/m³)"
            opacity={0.8}
          />
          <Line
            yAxisId="density"
            type="monotone"
            dataKey="ventilationRate"
            stroke={theme.palette.warning.main}
            strokeWidth={2}
            name="การระบายอากาศ (ครั้ง/ชม)"
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="beddingQuality"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            name="คุณภาพที่นอน (%)"
          />
          <Area
            yAxisId="percent"
            type="monotone"
            dataKey="comfortIndex"
            stroke={theme.palette.info.main}
            fill={theme.palette.info.light}
            fillOpacity={0.3}
            name="ดัชนีความสบาย (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Main Sensor Data Chart Component
const SensorDataChart: React.FC<SensorDataChartProps> = ({
  data,
  realTimeData,
  title = "ข้อมูลเซ็นเซอร์",
  showRealTime = true,
  showAlerts = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Count alerts by severity
  const alertCounts = {
    environment: data.summary.environment.alertCount,
    waterQuality: data.summary.waterQuality.alertCount,
    housingConditions: data.summary.housingConditions.alertCount
  };

  const totalAlerts = alertCounts.environment + alertCounts.waterQuality + alertCounts.housingConditions;

  return (
    <Box>
      {/* Real-time Status Overview */}
      {showRealTime && realTimeData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            🔴 สถานะแบบเรียลไทม์
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <RealTimeStatusCard
                title="อุณหภูมิ"
                value={realTimeData.environment.temperature}
                unit="°C"
                status={realTimeData.environment.alerts.some(a => a.type === 'temperature') ? 'warning' : 'normal'}
                icon={<Thermostat />}
                target={{ min: 24, max: 30 }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RealTimeStatusCard
                title="ความชื้น"
                value={realTimeData.environment.humidity}
                unit="%"
                status={realTimeData.environment.alerts.some(a => a.type === 'humidity') ? 'warning' : 'normal'}
                icon={<WaterDrop />}
                target={{ min: 60, max: 80 }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RealTimeStatusCard
                title="pH น้ำ"
                value={realTimeData.waterQuality.ph}
                unit=""
                status={realTimeData.waterQuality.alerts.some(a => a.type === 'ph') ? 'critical' : 'normal'}
                icon={<Science />}
                target={{ min: 6.5, max: 8.5 }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RealTimeStatusCard
                title="ความหนาแน่น"
                value={realTimeData.housingConditions.stockingDensity}
                unit="ตัว/m³"
                status={realTimeData.housingConditions.alerts.some(a => a.type === 'density') ? 'warning' : 'normal'}
                icon={<Home />}
                target={{ min: 10, max: 20 }}
              />
            </Grid>
          </Grid>

          {/* Overall Status */}
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`สถานะรวม: ${realTimeData.overallStatus === 'excellent' ? 'ดีเยี่ยม' :
                     realTimeData.overallStatus === 'good' ? 'ดี' :
                     realTimeData.overallStatus === 'fair' ? 'พอใช้' :
                     realTimeData.overallStatus === 'poor' ? 'ต้องปรับปรุง' : 'วิกฤต'}`}
              color={realTimeData.overallStatus === 'excellent' || realTimeData.overallStatus === 'good' ? 'success' :
                     realTimeData.overallStatus === 'fair' ? 'warning' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>
      )}

      {/* Alerts Summary */}
      {showAlerts && totalAlerts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>⚠️ การแจ้งเตือนระบบ</AlertTitle>
          พบการแจ้งเตือน {totalAlerts} รายการ - 
          สิ่งแวดล้อม: {alertCounts.environment}, 
          คุณภาพน้ำ: {alertCounts.waterQuality}, 
          สภาพที่อยู่อาศัย: {alertCounts.housingConditions}
        </Alert>
      )}

      {/* Main Chart Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant={isMobile ? "scrollable" : "fullWidth"}>
            <Tab 
              label={
                <Badge badgeContent={alertCounts.environment} color="error">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Thermostat />
                    สิ่งแวดล้อม
                  </Box>
                </Badge>
              }
            />
            <Tab 
              label={
                <Badge badgeContent={alertCounts.waterQuality} color="error">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Opacity />
                    คุณภาพน้ำ
                  </Box>
                </Badge>
              }
            />
            <Tab 
              label={
                <Badge badgeContent={alertCounts.housingConditions} color="error">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home />
                    สภาพที่อยู่อาศัย
                  </Box>
                </Badge>
              }
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            🌡️ ข้อมูลสิ่งแวดล้อม
          </Typography>
          <EnvironmentChart data={data.environment} />
          
          {/* Environment Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {data.summary.environment.avgTemperature}°C
                  </Typography>
                  <Typography variant="caption">อุณหภูมิเฉลี่ย</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {data.summary.environment.avgHumidity}%
                  </Typography>
                  <Typography variant="caption">ความชื้นเฉลี่ย</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="warning.main">
                    {data.summary.environment.maxCO2} ppm
                  </Typography>
                  <Typography variant="caption">CO₂ สูงสุด</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {data.summary.environment.alertCount}
                  </Typography>
                  <Typography variant="caption">การแจ้งเตือน</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            💧 ข้อมูลคุณภาพน้ำ
          </Typography>
          <WaterQualityChart data={data.waterQuality} />
          
          {/* Water Quality Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    {data.summary.waterQuality.avgPH}
                  </Typography>
                  <Typography variant="caption">pH เฉลี่ย</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {data.summary.waterQuality.avgQualityIndex}%
                  </Typography>
                  <Typography variant="caption">ดัชนีคุณภาพ</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="info.main">
                    {data.summary.waterQuality.totalVolume}L
                  </Typography>
                  <Typography variant="caption">ปริมาณน้ำรวม</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {data.summary.waterQuality.alertCount}
                  </Typography>
                  <Typography variant="caption">การแจ้งเตือน</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            🏠 ข้อมูลสภาพที่อยู่อาศัย
          </Typography>
          <HousingConditionsChart data={data.housingConditions} />
          
          {/* Housing Conditions Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="primary.main">
                    {data.summary.housingConditions.avgDensity}
                  </Typography>
                  <Typography variant="caption">ความหนาแน่นเฉลี่ย</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="warning.main">
                    {data.summary.housingConditions.avgVentilation}
                  </Typography>
                  <Typography variant="caption">การระบายอากาศ</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="success.main">
                    {data.summary.housingConditions.avgComfort}%
                  </Typography>
                  <Typography variant="caption">ดัชนีความสบาย</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" color="error.main">
                    {data.summary.housingConditions.alertCount}
                  </Typography>
                  <Typography variant="caption">การแจ้งเตือน</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SensorDataChart;