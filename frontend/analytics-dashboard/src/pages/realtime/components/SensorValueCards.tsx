import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Thermostat as TemperatureIcon,
  WaterDrop as WaterDropIcon,
  Air as AirIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Sensors as SensorsIcon,
} from '@mui/icons-material';

interface SensorValueCardsProps {
  latestValues: Record<string, number>;
}

export const SensorValueCards: React.FC<SensorValueCardsProps> = ({ latestValues }) => {
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
      default:
        return sensorType;
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Object.entries(latestValues).map(([sensorType, value]) => (
        <Grid item xs={12} sm={6} md={3} key={sensorType}>
          <Card 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${getSensorColor(sensorType)}20, #ffffff)`,
              border: `1px solid ${getSensorColor(sensorType)}40`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: getSensorColor(sensorType), mr: 2 }}>
                  {getSensorIcon(sensorType)}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="700" color={getSensorColor(sensorType)}>
                    {value} {getSensorUnit(sensorType)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getSensorName(sensorType)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={getStatusColor(value, sensorType) === 'success' ? 'ปกติ' :
                       getStatusColor(value, sensorType) === 'warning' ? 'เตือน' : 'ผิดปกติ'}
                color={getStatusColor(value, sensorType) as any}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

