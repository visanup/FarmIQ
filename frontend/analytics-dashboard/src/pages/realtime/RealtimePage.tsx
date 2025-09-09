import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useDevices, useDeviceHealth, useSensorReadings, useFarms } from '../../hooks/useApi';
import { RealtimeControls } from './components/RealtimeControls';
import { SensorValueCards } from './components/SensorValueCards';
import { RealtimeCharts } from './components/RealtimeCharts';
import { AlertsPanel } from './components/AlertsPanel';

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
      id={`realtime-tabpanel-${index}`}
      aria-labelledby={`realtime-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Real-time data generator
const generateRealtimeData = (deviceId: string, sensorType: string, timeRange: number = 24) => {
  const data = [];
  const now = new Date();
  
  for (let i = timeRange * 60; i >= 0; i -= 5) { // Every 5 minutes
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    let value = 0;
    
    switch (sensorType) {
      case 'temperature':
        value = 20 + Math.random() * 15 + Math.sin(i * 0.01) * 5 + Math.cos(i * 0.005) * 3;
        break;
      case 'humidity':
        value = 50 + Math.random() * 30 + Math.cos(i * 0.008) * 10 + Math.sin(i * 0.003) * 5;
        break;
      case 'air_quality':
        value = 30 + Math.random() * 40 + Math.sin(i * 0.012) * 8 + Math.cos(i * 0.007) * 6;
        break;
      case 'pressure':
        value = 1013 + Math.random() * 20 + Math.sin(i * 0.006) * 5;
        break;
      case 'light':
        value = Math.max(0, 100 + Math.random() * 900 + Math.sin(i * 0.02) * 200);
        break;
      case 'noise':
        value = 30 + Math.random() * 40 + Math.sin(i * 0.015) * 10;
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(value * 100) / 100,
      deviceId,
      sensorType,
    });
  }
  
  return data;
};

const RealtimePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedSensorType, setSelectedSensorType] = useState('all');
  const [timeRange, setTimeRange] = useState(24); // hours
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [alerts, setAlerts] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: devices = [], isLoading: devicesLoading } = useDevices();
  const { data: deviceHealth = [], isLoading: healthLoading } = useDeviceHealth();
  const { data: sensorReadings = [], isLoading: readingsLoading } = useSensorReadings();

  // Real-time data update effect
  useEffect(() => {
    if (isPlaying) {
      const updateData = () => {
        const newData = generateRealtimeData(selectedDevice, selectedSensorType, timeRange);
        setRealtimeData(newData);
        
        // Generate alerts based on data
        const latestData = newData[newData.length - 1];
        if (latestData) {
          const alerts = [];
          if (latestData.sensorType === 'temperature' && latestData.value > 35) {
            alerts.push({
              id: Date.now(),
              type: 'warning',
              message: `อุณหภูมิสูงเกินไป: ${latestData.value}°C`,
              timestamp: latestData.timestamp,
              deviceId: latestData.deviceId,
            });
          }
          if (latestData.sensorType === 'humidity' && latestData.value > 80) {
            alerts.push({
              id: Date.now() + 1,
              type: 'warning',
              message: `ความชื้นสูงเกินไป: ${latestData.value}%`,
              timestamp: latestData.timestamp,
              deviceId: latestData.deviceId,
            });
          }
          if (alerts.length > 0) {
            setAlerts(prev => [...alerts, ...prev].slice(0, 10)); // Keep last 10 alerts
          }
        }
      };

      updateData(); // Initial data
      intervalRef.current = setInterval(updateData, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, selectedDevice, selectedSensorType, timeRange, refreshInterval]);

  const getSensorColor = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return '#f44336';
      case 'humidity':
        return '#2196f3';
      case 'air_quality':
        return '#4caf50';
      case 'pressure':
        return '#ff9800';
      case 'light':
        return '#ffeb3b';
      case 'noise':
        return '#9c27b0';
      default:
        return '#607d8b';
    }
  };

  const filteredData = realtimeData.filter(data => 
    (selectedDevice === 'all' || data.deviceId === selectedDevice) &&
    (selectedSensorType === 'all' || data.sensorType === selectedSensorType)
  );

  const latestValues = filteredData.reduce((acc, data) => {
    if (!acc[data.sensorType]) {
      acc[data.sensorType] = data.value;
    }
    return acc;
  }, {} as Record<string, number>);

  if (farmsLoading || devicesLoading || healthLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลเซ็นเซอร์...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: 'primary.main'
                }}
              >
                ข้อมูลเซ็นเซอร์แบบเรียลไทม์
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                ตรวจสอบข้อมูลเซ็นเซอร์แบบเรียลไทม์ พร้อมการวิเคราะห์และแจ้งเตือน
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPlaying}
                    onChange={(e) => setIsPlaying(e.target.checked)}
                    color="primary"
                  />
                }
                label={isPlaying ? 'กำลังเล่น' : 'หยุด'}
              />
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <RealtimeControls
          selectedFarm={selectedFarm}
          setSelectedFarm={setSelectedFarm}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          selectedSensorType={selectedSensorType}
          setSelectedSensorType={setSelectedSensorType}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onRefresh={() => setRealtimeData(generateRealtimeData(selectedDevice, selectedSensorType, timeRange))}
          farms={farms}
          devices={devices}
        />

        {/* Real-time Values */}
        <SensorValueCards latestValues={latestValues} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="กราฟเรียลไทม์" />
            <Tab label="การแจ้งเตือน" />
            <Tab label="การวิเคราะห์" />
          </Tabs>
        </Box>

        {/* Real-time Chart Tab */}
        <TabPanel value={tabValue} index={0}>
          <RealtimeCharts
            filteredData={filteredData}
            selectedSensorType={selectedSensorType}
            getSensorColor={getSensorColor}
          />
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={1}>
          <AlertsPanel
            alerts={alerts}
            isRealTimeEnabled={isPlaying}
            refreshInterval={refreshInterval}
          />
        </TabPanel>

        {/* Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              การวิเคราะห์ขั้นสูง - กำลังพัฒนา
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
};

export default RealtimePage;