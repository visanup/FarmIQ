import React, { useState, useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { useSensorReadings, useFarms, useDevices, useRefreshData } from '../../hooks/useApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { RealtimeControls } from './components/RealtimeControls';
import { RealtimeCharts } from './components/RealtimeCharts';

const RealtimePage: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedSensorType, setSelectedSensorType] = useState('temperature');
  const [timeRange, setTimeRange] = useState(24); // hours
  const refreshAll = useRefreshData();

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: devices = [], isLoading: devicesLoading } = useDevices();

  const nowIso = new Date().toISOString();
  const startIso = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - timeRange);
    return d.toISOString();
  }, [timeRange]);

  const {
    data: sensorReadings = [],
    isLoading: readingsLoading,
    error: readingsError,
  } = useSensorReadings(
    {
      deviceId: selectedDevice !== 'all' ? selectedDevice : undefined,
      farmId: selectedFarm !== 'all' ? selectedFarm : undefined,
      sensorType: selectedSensorType !== 'all' ? selectedSensorType : undefined,
      startDate: startIso,
      endDate: nowIso,
      limit: 1000,
    },
    { refetchInterval: 5000, staleTime: 5000 }
  );

  const filteredDevices = useMemo(() => {
    if (selectedFarm === 'all') return devices;
    return devices.filter(d => d.farmId === selectedFarm);
  }, [devices, selectedFarm]);

  // Color palette for premium look
  const getSensorColor = (type: string) => {
    switch (type) {
      case 'temperature': return '#FF6B6B';
      case 'humidity': return '#4D96FF';
      case 'air_quality': return '#6BCB77';
      case 'pressure': return '#FFD166';
      case 'light': return '#A78BFA';
      case 'noise': return '#F19CBB';
      default: return '#00C2A8';
    }
  };

  // Prepare data for charts in a professional style
  const filteredData = useMemo(() => {
    const activeDeviceIds = new Set(
      (selectedDevice !== 'all' ? devices.filter(d => d.id === selectedDevice) : filteredDevices).map(d => d.id)
    );
    const activeType = selectedSensorType === 'all' ? 'temperature' : selectedSensorType;

    const startTs = new Date(startIso).getTime();
    const endTs = new Date(nowIso).getTime();

    return sensorReadings
      .filter(r => activeDeviceIds.has(r.deviceId))
      .filter(r => r.sensorType === activeType)
      .filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= startTs && t <= endTs;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(r => ({ time: r.timestamp, value: r.value }));
  }, [sensorReadings, devices, filteredDevices, selectedDevice, selectedSensorType, startIso, nowIso]);


  const isLoading = farmsLoading || devicesLoading || readingsLoading;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'fontWeightBold' }}>
          Real-time Monitoring
        </Typography>

        {/* Premium Filters */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <RealtimeControls
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              selectedSensorType={selectedSensorType}
              setSelectedSensorType={setSelectedSensorType}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              onRefresh={refreshAll}
              farms={farms}
              devices={devices}
            />
          </Grid>
        </Grid>

        {/* Data Display */}
        {isLoading && !sensorReadings.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : readingsError ? (
          <Alert severity="error">Failed to load sensor data.</Alert>
        ) : filteredData.length === 0 ? (
          <NoData message="ไม่มีข้อมูลเรียลไทม์ตามตัวกรองที่เลือก" />
        ) : (
          <RealtimeCharts
            filteredData={filteredData}
            selectedSensorType={selectedSensorType === 'all' ? 'temperature' : selectedSensorType}
            getSensorColor={getSensorColor}
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default RealtimePage;