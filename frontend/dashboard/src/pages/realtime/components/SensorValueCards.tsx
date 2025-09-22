import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Thermostat as TemperatureIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Sensors as SensorsIcon,
  Co2 as Co2Icon,
  LocalFireDepartment as Nh3Icon,
  WbSunny as IlluminanceIcon,
  AccessTime as PhotoperiodIcon,
  CloudQueue as VOCsIcon,
  Scale as WeightIcon,
  Restaurant as FeedIcon,
  Science as PhIcon,
  Water as WaterIcon,
  ElectricBolt as ECIcon,
  Opacity as TDSIcon,
  Pool as WaterVolumeIcon,
  AcUnit as WaterTempIcon,
} from '@mui/icons-material';

interface SensorValueCardsProps {
  latestValues: Record<string, number>;
}

export const SensorValueCards: React.FC<SensorValueCardsProps> = ({ latestValues }) => {
  const theme = useTheme();

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return <TemperatureIcon />;
      case 'humidity':
        return <WaterDropIcon />;
      case 'air_quality':
        return <AirIcon />;
      case 'pressure':
        return <SpeedIcon />;
      case 'light':
        return <VisibilityIcon />;
      case 'CO2':
        return <Co2Icon />;
      case 'NH3':
        return <Nh3Icon />;
      case 'illuminance':
        return <IlluminanceIcon />;
      case 'photoperiod':
        return <PhotoperiodIcon />;
      case 'VOCs':
        return <VOCsIcon />;
      case 'sensors.weight_predict.current_kg':
      case 'sensors.weight_scale.current_kg':
        return <WeightIcon />;
      case 'feed.intake.kg':
        return <FeedIcon />;
      case 'pH':
        return <PhIcon />;
      case 'TDS':
        return <TDSIcon />;
      case 'EC':
        return <ECIcon />;
      case 'water_volume':
        return <WaterVolumeIcon />;
      case 'water_temp':
        return <WaterTempIcon />;
      default:
        return <SensorsIcon />;
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
      case 'pressure':
        return 'hPa';
      case 'light':
        return 'lux';
      case 'noise':
        return 'dB';
      case 'CO2':
        return 'ppm';
      case 'NH3':
        return 'ppm';
      case 'illuminance':
        return 'lux';
      case 'photoperiod':
        return 'h';
      case 'VOCs':
        return 'ppb';
      case 'sensors.weight_predict.current_kg':
        return 'kg';
      case 'sensors.weight_scale.current_kg':
        return 'kg';
      case 'feed.intake.kg':
        return 'kg';
      case 'pH':
        return 'pH';
      case 'TDS':
        return 'ppm';
      case 'EC':
        return 'mS/cm';
      case 'water_volume':
        return 'L';
      case 'water_temp':
        return '°C';
      default:
        return '';
    }
  };

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
      case 'CO2':
        return '#795548';
      case 'NH3':
        return '#ff5722';
      case 'illuminance':
        return '#ffc107';
      case 'photoperiod':
        return '#673ab7';
      case 'VOCs':
        return '#607d8b';
      case 'sensors.weight_predict.current_kg':
        return '#4caf50';
      case 'sensors.weight_scale.current_kg':
        return '#2196f3';
      case 'feed.intake.kg':
        return '#ff9800';
      case 'pH':
        return '#e91e63';
      case 'TDS':
        return '#00bcd4';
      case 'EC':
        return '#9c27b0';
      case 'water_volume':
        return '#00bcd4';
      case 'water_temp':
        return '#03a9f4';
      default:
        return '#607d8b';
    }
  };

  const getStatusColor = (value: number, sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        if (value > 35) return 'error';
        if (value > 30) return 'warning';
        return 'success';
      case 'humidity':
        if (value > 80) return 'error';
        if (value > 70) return 'warning';
        return 'success';
      case 'air_quality':
        if (value > 100) return 'error';
        if (value > 50) return 'warning';
        return 'success';
      case 'CO2':
        if (value > 1000) return 'error';
        if (value > 800) return 'warning';
        return 'success';
      case 'NH3':
        if (value > 25) return 'error';
        if (value > 15) return 'warning';
        return 'success';
      case 'illuminance':
        if (value > 5000) return 'error';
        if (value > 3000) return 'warning';
        return 'success';
      case 'photoperiod':
        if (value > 16 || value < 8) return 'error';
        if (value > 14 || value < 10) return 'warning';
        return 'success';
      case 'VOCs':
        if (value > 600) return 'error';
        if (value > 400) return 'warning';
        return 'success';
      case 'sensors.weight_predict.current_kg':
      case 'sensors.weight_scale.current_kg':
        if (value < 1 || value > 10) return 'error';
        if (value < 2 || value > 8) return 'warning';
        return 'success';
      case 'feed.intake.kg':
        if (value < 0.5 || value > 5) return 'error';
        if (value < 1 || value > 4) return 'warning';
        return 'success';
      case 'pH':
        if (value < 6.5 || value > 8.0) return 'error';
        if (value < 6.8 || value > 7.5) return 'warning';
        return 'success';
      case 'TDS':
        if (value < 200 || value > 1500) return 'error';
        if (value < 300 || value > 1200) return 'warning';
        return 'success';
      case 'EC':
        if (value < 0.5 || value > 3.0) return 'error';
        if (value < 0.8 || value > 2.5) return 'warning';
        return 'success';
      case 'water_volume':
        if (value < 100 || value > 4000) return 'error';
        if (value < 200 || value > 3500) return 'warning';
        return 'success';
      case 'water_temp':
        if (value < 20 || value > 26) return 'error';
        if (value < 22 || value > 25) return 'warning';
        return 'success';
      default:
        return 'info';
    }
  };

  const getSensorName = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return 'อุณหภูมิ';
      case 'humidity':
        return 'ความชื้น';
      case 'air_quality':
        return 'คุณภาพอากาศ';
      case 'pressure':
        return 'ความดัน';
      case 'light':
        return 'แสงสว่าง';
      case 'noise':
        return 'เสียง';
      case 'CO2':
        return 'คาร์บอนไดออกไซด์';
      case 'NH3':
        return 'แอมโมเนีย';
      case 'illuminance':
        return 'ความสว่าง';
      case 'photoperiod':
        return 'ช่วงแสง';
      case 'VOCs':
        return 'สารอินทรีย์ระเหย';
      case 'sensors.weight_predict.current_kg':
        return 'น้ำหนัก Estimate';
      case 'sensors.weight_scale.current_kg':
        return 'น้ำหนักเครื่องชั่ง';
      case 'feed.intake.kg':
        return 'ปริมาณอาหาร';
      case 'pH':
        return 'ค่า pH';
      case 'TDS':
        return 'Total Dissolved Solids';
      case 'EC':
        return 'ค่าการนำไฟฟ้า';
      case 'water_volume':
        return 'ปริมาณน้ำ';
      case 'water_temp':
        return 'อุณหภูมิน้ำ';
      default:
        return sensorType;
    }
  };

  const getProgressValue = (value: number, sensorType: string) => {
    switch (sensorType) {
      case 'temperature':
        return Math.min((value / 40) * 100, 100);
      case 'humidity':
        return value;
      case 'CO2':
        return Math.min((value / 1500) * 100, 100);
      case 'NH3':
        return Math.min((value / 50) * 100, 100);
      case 'illuminance':
        return Math.min((value / 6000) * 100, 100);
      case 'photoperiod':
        return (value / 24) * 100;
      case 'VOCs':
        return Math.min((value / 800) * 100, 100);
      case 'sensors.weight_predict.current_kg':
      case 'sensors.weight_scale.current_kg':
        return Math.min((value / 10) * 100, 100);
      case 'feed.intake.kg':
        return Math.min((value / 5) * 100, 100);
      case 'pH':
        return ((value - 6) / 2.5) * 100; // 6-8.5 range
      case 'TDS':
        return Math.min((value / 2000) * 100, 100);
      case 'EC':
        return Math.min((value / 5) * 100, 100);
      case 'water_volume':
        return Math.min((value / 5000) * 100, 100);
      case 'water_temp':
        return Math.min(((value - 18) / 10) * 100, 100); // 18-28 range
      default:
        return 50;
    }
  };

  // Filter out timestamp values and only show sensor data
  const sensorEntries = Object.entries(latestValues).filter(([key]) => !key.includes('_timestamp'));

  return (
    <Grid container spacing={1.5} sx={{ mb: 4, justifyContent: 'center', overflowX: 'auto' }}>
      {sensorEntries.map(([sensorType, value]) => {
        const color = getSensorColor(sensorType);
        const status = getStatusColor(value, sensorType);
        const progressValue = getProgressValue(value, sensorType);
        
        return (
          <Grid item xs={12} sm={6} md={3} lg={2} xl={1.5} key={sensorType} sx={{ minWidth: '180px' }}>
            <Card
              sx={{
                height: 200, // ลดความสูงเพื่อให้ใส่ได้มากขึ้น
                width: '100%', // ให้กว้างเต็ม
                background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
                border: `2px solid ${alpha(color, 0.2)}`,
                borderRadius: 4, // Use theme borderRadius
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                },
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.01)',
                  boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
                  borderColor: color,
                },
              }}
            >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                  {/* Header with Title */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        mb: 0.5,
                        fontSize: '0.85rem'
                      }}
                    >
                      {getSensorName(sensorType)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: color,
                          width: 36,
                          height: 36,
                          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                          border: `2px solid ${alpha(color, 0.2)}`,
                        }}
                      >
                        {getSensorIcon(sensorType)}
                      </Avatar>
                      <Chip
                        label={status === 'success' ? 'ปกติ' : status === 'warning' ? 'เตือน' : 'ผิดปกติ'}
                        color={status as any}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 20,
                          px: 0.5,
                          boxShadow: `0 2px 6px ${alpha(color, 0.3)}`,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Value */}
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: color,
                        lineHeight: 1,
                        mb: 0.5,
                        textShadow: `0 2px 4px ${alpha(color, 0.3)}`,
                        fontSize: '1.8rem',
                      }}
                    >
                      {value.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        mb: 1.5,
                        opacity: 0.8,
                        fontSize: '0.9rem',
                      }}
                    >
                      {getSensorUnit(sensorType)}
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mt: 'auto', width: '100%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(color, 0.2),
                        mb: 0.5,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.6rem',
                        fontWeight: 500,
                        textAlign: 'center',
                        opacity: 0.8,
                        display: 'block',
                      }}
                    >
                      ค่าปัจจุบัน
                    </Typography>
                  </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

