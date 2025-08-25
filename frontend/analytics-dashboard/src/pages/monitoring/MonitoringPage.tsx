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
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Badge,
  useTheme,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Sensors as SensorsIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Air as AirIcon,
  Agriculture as AgricultureIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface MonitoringAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  farm: string;
  timestamp: string;
  resolved: boolean;
}

interface SensorData {
  id: string;
  name: string;
  type: string;
  farm: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  threshold: { min: number; max: number };
}

const mockAlerts: MonitoringAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Soil Moisture Critical',
    message: 'Soil moisture in North Field Farm has dropped below critical level (15%)',
    farm: 'North Field Farm',
    timestamp: '5 minutes ago',
    resolved: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Temperature Alert',
    message: 'Greenhouse temperature exceeding optimal range (32°C)',
    farm: 'Greenhouse Complex',
    timestamp: '12 minutes ago',
    resolved: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Device Offline',
    message: 'Sensor device #007 in Organic Valley is not responding',
    farm: 'Organic Valley',
    timestamp: '25 minutes ago',
    resolved: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'Irrigation Cycle Complete',
    message: 'Automated irrigation cycle completed successfully',
    farm: 'North Field Farm',
    timestamp: '1 hour ago',
    resolved: true,
  },
];

const mockSensors: SensorData[] = [
  {
    id: '1',
    name: 'Soil Moisture Sensor #001',
    type: 'moisture',
    farm: 'North Field Farm',
    value: 65,
    unit: '%',
    status: 'online',
    lastUpdate: '2 minutes ago',
    threshold: { min: 40, max: 80 },
  },
  {
    id: '2',
    name: 'Temperature Sensor #002',
    type: 'temperature',
    farm: 'Greenhouse Complex',
    value: 28.5,
    unit: '°C',
    status: 'online',
    lastUpdate: '1 minute ago',
    threshold: { min: 20, max: 30 },
  },
  {
    id: '3',
    name: 'pH Sensor #003',
    type: 'ph',
    farm: 'Organic Valley',
    value: 6.8,
    unit: 'pH',
    status: 'warning',
    lastUpdate: '3 minutes ago',
    threshold: { min: 6.0, max: 7.5 },
  },
  {
    id: '4',
    name: 'Humidity Sensor #004',
    type: 'humidity',
    farm: 'Greenhouse Complex',
    value: 75,
    unit: '%',
    status: 'online',
    lastUpdate: '1 minute ago',
    threshold: { min: 60, max: 85 },
  },
];

const MonitoringPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <CheckCircleIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'moisture':
        return <WaterIcon />;
      case 'temperature':
        return <ThermostatIcon />;
      case 'humidity':
        return <AirIcon />;
      default:
        return <SensorsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  };

  const activeAlerts = mockAlerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.type === 'warning');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Real-time Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your farms in real-time and manage alerts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.error.main,
                  mr: 2,
                }}
              >
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {criticalAlerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Alerts
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.warning.main,
                  mr: 2,
                }}
              >
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {warningAlerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Warning Alerts
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  mr: 2,
                }}
              >
                <SensorsIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {mockSensors.filter(s => s.status === 'online').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Sensors
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <AgricultureIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  3
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitored Farms
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            label={
              <Badge badgeContent={activeAlerts.length} color="error">
                Alerts
              </Badge>
            }
          />
          <Tab label="Sensors" />
          <Tab label="Status" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Active Alerts */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Active Alerts
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        icon={<NotificationsOffIcon />}
                        checkedIcon={<NotificationsIcon />}
                      />
                    }
                    label="Notifications"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activeAlerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={getAlertColor(alert.type) as any}
                      sx={{ borderRadius: 2 }}
                      action={
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <AlertTitle sx={{ fontWeight: 600 }}>
                        {alert.title}
                      </AlertTitle>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {alert.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={alert.farm}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {alert.timestamp}
                        </Typography>
                      </Box>
                    </Alert>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alert Summary */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Alert Summary
                </Typography>
                <List disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Critical"
                      secondary={`${criticalAlerts.length} active alerts`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon sx={{ color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Warning"
                      secondary={`${warningAlerts.length} active alerts`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Resolved Today"
                      secondary={`${mockAlerts.filter(a => a.resolved).length} alerts`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Sensor Status
            </Typography>
            <Grid container spacing={2}>
              {mockSensors.map((sensor) => (
                <Grid item xs={12} sm={6} lg={4} key={sensor.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: getStatusColor(sensor.status),
                      borderWidth: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${getStatusColor(sensor.status)}20`,
                          color: getStatusColor(sensor.status),
                          mr: 2,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getSensorIcon(sensor.type)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {sensor.name}
                        </Typography>
                        <Chip
                          label={sensor.status.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(sensor.status)}20`,
                            color: getStatusColor(sensor.status),
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {sensor.value}{sensor.unit}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(sensor.value / (sensor.threshold.max - sensor.threshold.min)) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${getStatusColor(sensor.status)}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(sensor.status),
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Min: {sensor.threshold.min}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Max: {sensor.threshold.max}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {sensor.farm}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sensor.lastUpdate}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              System Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Service Health
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Data Collection Service" secondary="Operational" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Alert Processing" secondary="Operational" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon sx={{ color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Weather API" secondary="Degraded Performance" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Network Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="MQTT Broker" secondary="Connected" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Database Connection" secondary="Stable" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Edge Devices" secondary="12/14 Online" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MonitoringPage;