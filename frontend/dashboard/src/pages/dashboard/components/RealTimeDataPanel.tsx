// Real-time Data Panel Component
// Demonstrates integration with Master Service and Analytics Service
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useMasterData } from '../../../hooks/useMasterData';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

interface RealTimeDataPanelProps {
  farmId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeDataPanel({ 
  farmId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: RealTimeDataPanelProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Master data hook
  const {
    farms,
    devices,
    animals,
    loading: masterLoading,
    error: masterError,
    fetchAll: refreshMasterData,
  } = useMasterData({ autoRefresh, refreshInterval });

  // Analytics data hook
  const {
    dashboardSummary,
    anomalies,
    kpiMetrics,
    loading: analyticsLoading,
    error: analyticsError,
    criticalAnomalies,
    highAnomalies,
    avgFCR,
    fetchAll: refreshAnalyticsData,
  } = useAnalyticsData({ 
    autoRefresh, 
    refreshInterval,
    defaultFilters: farmId ? { farmId } : {}
  });

  // Filter data by farm if specified
  const filteredFarms = farmId ? farms.filter(f => f.id === farmId) : farms;
  const filteredDevices = farmId ? devices.filter(d => d.farmId === farmId) : devices;
  const filteredAnimals = farmId ? animals.filter(a => a.farmId === farmId) : animals;

  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await Promise.all([
      refreshMasterData(),
      refreshAnalyticsData(farmId ? { farmId } : {}),
    ]);
  };

  const isLoading = masterLoading || analyticsLoading;
  const hasError = masterError || analyticsError;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Real-time Data Panel
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isLoading}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {hasError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Some services are unavailable. Data may be limited.
        </Alert>
      )}

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        {/* Farm Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Farm Overview" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {filteredFarms.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Farms
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {filteredFarms.filter(f => f.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Farms
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Device Status" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {filteredDevices.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Devices
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {dashboardSummary?.onlineDevices || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Online Devices
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Animal Count */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Animal Count" />
            <CardContent>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {filteredAnimals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Animals
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Alerts" />
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {criticalAnomalies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Critical
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {highAnomalies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI Metrics */}
        {kpiMetrics.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Key Performance Indicators" />
              <CardContent>
                <Grid container spacing={2}>
                  {kpiMetrics.slice(0, 4).map((kpi, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Box textAlign="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Typography variant="h5" color="primary">
                            {kpi.value.toFixed(1)}
                          </Typography>
                          {kpi.trend === 'up' && <TrendingUpIcon color="success" sx={{ ml: 1 }} />}
                          {kpi.trend === 'down' && <TrendingDownIcon color="error" sx={{ ml: 1 }} />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {kpi.metric.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kpi.unit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* FCR Performance */}
        {avgFCR > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Feed Conversion Ratio (FCR)" />
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {avgFCR.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average FCR
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Good Performance" 
                      color="success" 
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Anomalies */}
        {anomalies.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Anomalies" />
              <CardContent>
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {anomaly.metric.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {anomaly.description}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<WarningIcon />}
                        label={anomaly.severity.toUpperCase()}
                        color={
                          anomaly.severity === 'critical' ? 'error' :
                          anomaly.severity === 'high' ? 'warning' :
                          anomaly.severity === 'medium' ? 'info' : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
