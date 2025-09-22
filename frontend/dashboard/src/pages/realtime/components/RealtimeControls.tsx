import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Slider,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon } from '@mui/icons-material';

interface RealtimeControlsProps {
  selectedFarm: string;
  setSelectedFarm: (farm: string) => void;
  selectedDevice: string;
  setSelectedDevice: (device: string) => void;
  selectedSensorType: string;
  setSelectedSensorType: (type: string) => void;
  timeRange: number;
  setTimeRange: (range: number) => void;
  onRefresh: () => void;
  farms: any[];
  devices: any[];
}

export const RealtimeControls: React.FC<RealtimeControlsProps> = ({
  selectedFarm,
  setSelectedFarm,
  selectedDevice,
  setSelectedDevice,
  selectedSensorType,
  setSelectedSensorType,
  timeRange,
  setTimeRange,
  onRefresh,
  farms,
  devices,
}) => {
  const theme = useTheme();
  const filteredDevices = devices.filter(device => 
    selectedFarm === 'all' || device.farmId === selectedFarm
  );

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            ตัวกรองข้อมูลเรียลไทม์
          </Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}>
              <InputLabel>ฟาร์ม</InputLabel>
              <Select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                label="ฟาร์ม"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>อุปกรณ์</InputLabel>
              <Select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                label="อุปกรณ์"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                {filteredDevices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>ประเภทเซ็นเซอร์</InputLabel>
              <Select
                value={selectedSensorType}
                onChange={(e) => setSelectedSensorType(e.target.value)}
                label="ประเภทเซ็นเซอร์"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="temperature">อุณหภูมิ</MenuItem>
                <MenuItem value="humidity">ความชื้น</MenuItem>
                <MenuItem value="air_quality">คุณภาพอากาศ</MenuItem>
                <MenuItem value="pressure">ความดัน</MenuItem>
                <MenuItem value="light">แสงสว่าง</MenuItem>
                <MenuItem value="noise">เสียง</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ช่วงเวลา: {timeRange} ชั่วโมง
              </Typography>
              <Slider
                value={timeRange}
                onChange={(e, value) => setTimeRange(value as number)}
                min={1}
                max={72}
                step={1}
                marks={[
                  { value: 1, label: '1h' },
                  { value: 6, label: '6h' },
                  { value: 24, label: '24h' },
                  { value: 72, label: '72h' },
                ]}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

