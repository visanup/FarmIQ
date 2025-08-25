import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  useTheme,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Grain as RainIcon,
  Air as WindIcon,
  Thermostat as TemperatureIcon,
  Water as HumidityIcon,
  Visibility as VisibilityIcon,
  Compress as PressureIcon,
  Agriculture as AgricultureIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Thunderstorm as ThunderstormIcon,
  AcUnit as ColdIcon,
  Whatshot as HotIcon,
} from '@mui/icons-material';
import { weatherService, THAILAND_REGIONS, type ProcessedWeatherData } from '@/services/weather';

// Weather condition icons mapping
const getWeatherIcon = (condition: string, size: 'small' | 'medium' | 'large' = 'medium') => {
  const iconProps = {
    sx: {
      fontSize: size === 'small' ? '1.5rem' : size === 'medium' ? '2rem' : '3rem'
    }
  };

  switch (condition.toLowerCase()) {
    case 'clear':
      return <SunnyIcon {...iconProps} />;
    case 'partly cloudy':
    case 'cloudy':
    case 'overcast':
      return <CloudIcon {...iconProps} />;
    case 'light rain':
    case 'moderate rain':
    case 'heavy rain':
      return <RainIcon {...iconProps} />;
    case 'thunderstorm':
      return <ThunderstormIcon {...iconProps} />;
    case 'very cold':
    case 'cold':
    case 'cool':
      return <ColdIcon {...iconProps} />;
    case 'very hot':
      return <HotIcon {...iconProps} />;
    default:
      return <CloudIcon {...iconProps} />;
  }
};

// Agricultural impact calculation
const calculateAgriculturalImpact = (weatherData: ProcessedWeatherData) => {
  const { current, forecast } = weatherData;
  
  // Irrigation efficiency (affected by rainfall and humidity)
  const upcomingRain = forecast.slice(0, 24).reduce((sum, f) => sum + f.rainfall, 0);
  const irrigationEfficiency = Math.min(100, Math.max(0, 
    100 - (upcomingRain * 2) + (current.humidity > 70 ? 10 : 0)
  ));
  
  // Crop growth conditions (optimal temp 20-30°C, humidity 50-70%)
  const tempScore = current.temperature >= 20 && current.temperature <= 30 ? 100 : 
    Math.max(0, 100 - Math.abs(25 - current.temperature) * 5);
  const humidityScore = current.humidity >= 50 && current.humidity <= 70 ? 100 : 
    Math.max(0, 100 - Math.abs(60 - current.humidity) * 2);
  const cropGrowthConditions = (tempScore + humidityScore) / 2;
  
  // Disease risk (high humidity + moderate temperature)
  const diseaseRisk = current.humidity > 80 && current.temperature > 25 && current.temperature < 35 ? 
    Math.min(100, current.humidity + (30 - Math.abs(30 - current.temperature)) * 2) : 
    Math.max(0, current.humidity - 50);
  
  return {
    irrigationEfficiency: Math.round(irrigationEfficiency),
    cropGrowthConditions: Math.round(cropGrowthConditions),
    diseaseRisk: Math.round(diseaseRisk)
  };
};

const WeatherPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('Chiang Mai');
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load weather data for selected region
  const loadWeatherData = async (region: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getRegionWeather(region);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and region change handler
  useEffect(() => {
    loadWeatherData(selectedRegion);
  }, [selectedRegion]);

  // Handle region change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadWeatherData(selectedRegion);
  };

  // Get weather alerts from current data
  const weatherAlerts = weatherData ? weatherService.getWeatherAlerts(weatherData) : [];

  // Calculate agricultural impact
  const agriculturalImpact = weatherData ? calculateAgriculturalImpact(weatherData) : null;

  // Group forecast by day for 7-day view
  const getDailyForecast = () => {
    if (!weatherData) return [];
    
    const dailyData: { [key: string]: any } = {};
    
    weatherData.forecast.forEach(item => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = {
          date: item.date,
          temps: [item.temperature],
          rainfall: [item.rainfall],
          humidity: [item.humidity],
          conditions: [item.condition],
          conditionCodes: [item.conditionCode]
        };
      } else {
        dailyData[item.date].temps.push(item.temperature);
        dailyData[item.date].rainfall.push(item.rainfall);
        dailyData[item.date].humidity.push(item.humidity);
        dailyData[item.date].conditions.push(item.condition);
        dailyData[item.date].conditionCodes.push(item.conditionCode);
      }
    });

    return Object.values(dailyData).slice(0, 7).map((day: any, index) => {
      const maxTemp = Math.max(...day.temps);
      const minTemp = Math.min(...day.temps);
      const totalRain = day.rainfall.reduce((sum: number, r: number) => sum + r, 0);
      const avgHumidity = Math.round(day.humidity.reduce((sum: number, h: number) => sum + h, 0) / day.humidity.length);
      
      // Most common condition
      const conditionCounts: { [key: string]: number } = {};
      day.conditions.forEach((condition: string) => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
      const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
        conditionCounts[a] > conditionCounts[b] ? a : b
      );

      const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      
      return {
        date: day.date,
        day: dayNames[index] || new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(maxTemp),
        low: Math.round(minTemp),
        condition: mostCommonCondition,
        precipitation: Math.round(totalRain * 10) / 10,
        humidity: avgHumidity,
        icon: getWeatherIcon(mostCommonCondition, 'medium')
      };
    });
  };

  const dailyForecast = getDailyForecast();

  // Calculate UV index from solar radiation (approximation)
  const calculateUVIndex = (solarRadiation: number): number => {
    // Rough approximation: UV Index = Solar Radiation / 100
    return Math.round(Math.max(0, Math.min(12, solarRadiation / 100)));
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return theme.palette.success.main;
    if (uvIndex <= 5) return theme.palette.warning.main;
    if (uvIndex <= 7) return theme.palette.error.main;
    return theme.palette.error.dark;
  };

  const getUVIndexLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    return 'Very High';
  };

  // Loading skeleton component
  const WeatherSkeleton = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={100} height={60} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width={150} height={30} sx={{ mx: 'auto' }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant="text" width={60} height={30} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant="text" width={80} height={20} sx={{ mx: 'auto' }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Weather & Environment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor weather conditions and environmental factors affecting your farms
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={selectedRegion}
              label="Region"
              onChange={(e) => handleRegionChange(e.target.value)}
              disabled={loading}
            >
              {Object.keys(THAILAND_REGIONS).map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
              />
            }
            label="Weather Alerts"
          />
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          <AlertTitle>Error Loading Weather Data</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Weather Alerts */}
      {alertsEnabled && weatherAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {weatherAlerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.type}
              sx={{ borderRadius: 2, mb: 2 }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>
                {alert.title}
              </AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {alert.message}
              </Typography>
              <Chip
                label={`${alert.severity.toUpperCase()} PRIORITY`}
                size="small"
                color={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                sx={{ fontSize: '0.7rem' }}
              />
            </Alert>
          ))}
        </Box>
      )}

      {/* Loading State */}
      {loading && !weatherData && <WeatherSkeleton />}

      {/* Current Weather Overview */}
      {weatherData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Current Weather - {weatherData.location}
              </Typography>
              <Chip
                label={`${weatherData.coordinates.lat.toFixed(2)}°N, ${weatherData.coordinates.lon.toFixed(2)}°E`}
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Grid container spacing={3}>
              {/* Main Weather Display */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      fontSize: '2rem',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {getWeatherIcon(weatherData.current.condition, 'large')}
                  </Avatar>
                  <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    {weatherData.current.temperature.toFixed(1)}°C
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    {weatherData.current.condition}
                  </Typography>
                  {weatherData.current.rainfall > 0 && (
                    <Typography variant="body2" color="info.main">
                      {weatherData.current.rainfall}mm rainfall
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Weather Details */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <HumidityIcon sx={{ color: theme.palette.info.main, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {weatherData.current.humidity}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Humidity
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <WindIcon sx={{ color: theme.palette.secondary.main, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {weatherData.current.windSpeed.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        km/h {weatherData.current.windDirection}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <PressureIcon sx={{ color: theme.palette.warning.main, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {weatherData.current.pressure.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        hPa
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      {(() => {
                        const uvIndex = calculateUVIndex(weatherData.current.solarRadiation);
                        return (
                          <>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: getUVIndexColor(uvIndex),
                                mx: 'auto',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              UV
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {uvIndex}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getUVIndexLevel(uvIndex)}
                            </Typography>
                          </>
                        );
                      })()}
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label="7-Day Forecast" />
          <Tab label="Agricultural Impact" />
          <Tab label="Historical Data" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {currentTab === 0 && (
        <>
          {loading && !weatherData ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Grid item xs={12} sm={6} md key={i}>
                  <Card sx={{ p: 2 }}>
                    <Skeleton variant="text" width={80} height={30} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width={100} height={20} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="rectangular" height={60} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : dailyForecast.length > 0 ? (
            <Grid container spacing={2}>
              {dailyForecast.map((day, index) => (
                <Grid item xs={12} sm={6} md key={index}>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {day.day}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        {day.icon}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {day.condition}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">High</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {day.high}°C
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Low</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {day.low}°C
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Rain</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {day.precipitation}mm
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, day.precipitation * 2)} // Scale for better visualization
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.info.main,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Humidity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {day.humidity}%
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No forecast data available. Please try refreshing or selecting a different region.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {currentTab === 1 && (
        <>
          {loading && !weatherData ? (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
                    {[1, 2, 3, 4].map((i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" height={24} />
                          <Skeleton variant="text" width="60%" height={20} />
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ mb: 3 }}>
                        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                        <Skeleton variant="rectangular" height={8} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : weatherData && agriculturalImpact ? (
            <Grid container spacing={3}>
              {/* Agricultural Recommendations */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Agricultural Recommendations for {weatherData.location}
                    </Typography>
                    
                    <List>
                      {/* Irrigation recommendation */}
                      <ListItem>
                        <ListItemIcon>
                          <AgricultureIcon sx={{ 
                            color: agriculturalImpact.irrigationEfficiency > 80 ? 
                              theme.palette.success.main : 
                              agriculturalImpact.irrigationEfficiency > 60 ? 
                                theme.palette.warning.main : 
                                theme.palette.error.main 
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Irrigation Schedule"
                          secondary={(() => {
                            const upcomingRain = weatherData.forecast.slice(0, 24).reduce((sum, f) => sum + f.rainfall, 0);
                            if (upcomingRain > 20) {
                              return `Reduce watering by ${Math.round(upcomingRain * 2)}% due to expected ${upcomingRain.toFixed(1)}mm rainfall in next 24 hours.`;
                            } else if (weatherData.current.humidity < 50) {
                              return "Increase irrigation frequency due to low humidity and dry conditions.";
                            } else {
                              return "Maintain normal irrigation schedule. Monitor soil moisture levels.";
                            }
                          })()}
                        />
                      </ListItem>
                      
                      {/* Temperature-based recommendations */}
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon sx={{ 
                            color: weatherData.current.temperature > 35 ? 
                              theme.palette.error.main : 
                              weatherData.current.temperature < 15 ? 
                                theme.palette.info.main : 
                                theme.palette.success.main 
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Temperature Management"
                          secondary={(() => {
                            if (weatherData.current.temperature > 35) {
                              return `High temperature (${weatherData.current.temperature}°C) detected. Provide shade for sensitive crops and increase watering frequency.`;
                            } else if (weatherData.current.temperature < 15) {
                              return `Cool temperature (${weatherData.current.temperature}°C). Consider frost protection for sensitive plants.`;
                            } else {
                              return `Optimal temperature range (${weatherData.current.temperature}°C). Good conditions for most agricultural activities.`;
                            }
                          })()}
                        />
                      </ListItem>
                      
                      {/* Wind-based recommendations */}
                      <ListItem>
                        <ListItemIcon>
                          <WindIcon sx={{ 
                            color: weatherData.current.windSpeed > 50 ? 
                              theme.palette.error.main : 
                              weatherData.current.windSpeed > 30 ? 
                                theme.palette.warning.main : 
                                theme.palette.success.main 
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Wind Management"
                          secondary={(() => {
                            if (weatherData.current.windSpeed > 50) {
                              return `Strong winds (${weatherData.current.windSpeed.toFixed(1)} km/h) detected. Secure greenhouse panels and provide support for tall crops.`;
                            } else if (weatherData.current.windSpeed > 30) {
                              return `Moderate winds (${weatherData.current.windSpeed.toFixed(1)} km/h). Monitor young plants and loose structures.`;
                            } else {
                              return `Light winds (${weatherData.current.windSpeed.toFixed(1)} km/h). Good conditions for spraying and field operations.`;
                            }
                          })()}
                        />
                      </ListItem>
                      
                      {/* Disease risk assessment */}
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon sx={{ 
                            color: agriculturalImpact.diseaseRisk > 70 ? 
                              theme.palette.error.main : 
                              agriculturalImpact.diseaseRisk > 40 ? 
                                theme.palette.warning.main : 
                                theme.palette.success.main 
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Disease Management"
                          secondary={(() => {
                            if (agriculturalImpact.diseaseRisk > 70) {
                              return `High disease risk due to humidity (${weatherData.current.humidity}%) and temperature. Apply preventive fungicide treatments.`;
                            } else if (agriculturalImpact.diseaseRisk > 40) {
                              return `Moderate disease risk. Monitor crops closely and maintain good air circulation.`;
                            } else {
                              return "Low disease risk. Continue regular monitoring and maintenance practices.";
                            }
                          })()}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Impact Summary */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Weather Impact Summary
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Irrigation Efficiency
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={agriculturalImpact.irrigationEfficiency}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: agriculturalImpact.irrigationEfficiency > 80 ? 
                              theme.palette.success.main : 
                              agriculturalImpact.irrigationEfficiency > 60 ? 
                                theme.palette.warning.main : 
                                theme.palette.error.main,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {agriculturalImpact.irrigationEfficiency}% - {
                          agriculturalImpact.irrigationEfficiency > 80 ? 'Optimal' :
                          agriculturalImpact.irrigationEfficiency > 60 ? 'Good' : 'Needs adjustment'
                        }
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Crop Growth Conditions
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={agriculturalImpact.cropGrowthConditions}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: agriculturalImpact.cropGrowthConditions > 80 ? 
                              theme.palette.success.main : 
                              agriculturalImpact.cropGrowthConditions > 60 ? 
                                theme.palette.warning.main : 
                                theme.palette.error.main,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {agriculturalImpact.cropGrowthConditions}% - {
                          agriculturalImpact.cropGrowthConditions > 80 ? 'Excellent' :
                          agriculturalImpact.cropGrowthConditions > 60 ? 'Good' : 'Suboptimal'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Disease Risk
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={agriculturalImpact.diseaseRisk}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: agriculturalImpact.diseaseRisk > 70 ? 
                              theme.palette.error.main : 
                              agriculturalImpact.diseaseRisk > 40 ? 
                                theme.palette.warning.main : 
                                theme.palette.success.main,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {agriculturalImpact.diseaseRisk}% - {
                          agriculturalImpact.diseaseRisk > 70 ? 'High risk' :
                          agriculturalImpact.diseaseRisk > 40 ? 'Moderate risk' : 'Low risk'
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No weather data available for agricultural impact analysis.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Historical Weather Data & TMD API Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Data Source: Thai Meteorological Department (TMD)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This weather forecast system integrates with the TMD API to provide area-level weather forecasting 
                  for agricultural planning across Thailand.
                </Typography>
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Available Regions:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {Object.keys(THAILAND_REGIONS).map((region) => (
                    <Chip
                      key={region}
                      label={region}
                      size="small"
                      variant={region === selectedRegion ? 'filled' : 'outlined'}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  TMD API Domains:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Domain 0"
                      secondary="6-hour forecasts, 126 days ahead, 27km resolution"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Domain 1"
                      secondary="3-hour forecasts, 10 days ahead, 18km resolution"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Domain 2 (Current)"
                      secondary="1-hour forecasts, 72 hours ahead, 6km resolution"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: theme.palette.info.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Domain 3"
                      secondary="1-hour forecasts, 48 hours ahead, 2km resolution"
                    />
                  </ListItem>
                </List>
              </Grid>
              
              {weatherData && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>Current Data Information</AlertTitle>
                    <Typography variant="body2">
                      Showing weather data for <strong>{weatherData.location}</strong> at coordinates{' '}
                      <strong>{weatherData.coordinates.lat.toFixed(4)}°N, {weatherData.coordinates.lon.toFixed(4)}°E</strong>.
                      Data includes current conditions and {weatherData.forecast.length}-hour detailed forecast.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeatherPage;