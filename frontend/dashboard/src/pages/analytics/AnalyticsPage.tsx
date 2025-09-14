import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAgg, useFactories, useMachines, useMetricsCatalog, useTenants, useAnalyticsHealth, useKpi, useAnomalies } from '../../hooks/useAnalytics';
import { DEFAULT_FACTORIES, DEFAULT_MACHINES, DEFAULT_METRICS, DEFAULT_WINDOWS_S, DEFAULT_TENANT_ID } from '../../config/analytics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { ChartCard } from '../dashboard/components/ChartCard'; 
import { KpiCard } from './components/KpiCard';

const AnalyticsPage: React.FC = () => {
  const [tenantId, setTenantId] = useState<string>(DEFAULT_TENANT_ID);
  const [factoryId, setFactoryId] = useState<string>(DEFAULT_FACTORIES[0]);
  const [machineId, setMachineId] = useState<string>(DEFAULT_MACHINES[0]);
  const [metric, setMetric] = useState<string>(DEFAULT_METRICS[0]);
  const [windowS, setWindowS] = useState<number>(DEFAULT_WINDOWS_S[1]);
  const [rangeHours, setRangeHours] = useState<number>(1);

  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const { data: factories = [], isLoading: factoriesLoading } = useFactories(tenantId);
  const { data: machines = [], isLoading: machinesLoading } = useMachines({ tenant_id: tenantId, factory_id: factoryId }, !!factoryId);
  const { data: metricsList = [], isLoading: metricsLoading } = useMetricsCatalog({ tenant_id: tenantId, factory_id: factoryId, machine_id: machineId }, true);

  const tenantOptions = tenants.length ? tenants : [DEFAULT_TENANT_ID];
  const factoryOptions = factories.length ? factories : DEFAULT_FACTORIES;
  const machineOptions = machines.length ? machines : DEFAULT_MACHINES;
  const metricOptions = metricsList.length ? metricsList : DEFAULT_METRICS;
  
  const { data: health } = useAnalyticsHealth();

  useEffect(() => {
    if (factoryOptions.length > 0 && !factoryOptions.includes(factoryId)) {
      setFactoryId(factoryOptions[0]);
    }
  }, [factoryId, factoryOptions]);

  useEffect(() => {
    if (machineOptions.length > 0 && !machineOptions.includes(machineId)) {
      setMachineId(machineOptions[0]);
    }
  }, [machineId, machineOptions]);
  
  useEffect(() => {
    if (metricOptions.length > 0 && !metricOptions.includes(metric)) {
      setMetric(metricOptions[0]);
    }
  }, [metric, metricOptions]);

  const now = new Date();
  const endIso = now.toISOString();
  const startIso = new Date(now.getTime() - rangeHours * 60 * 60 * 1000).toISOString();
  
  const queryOptions = {
    tenant_id: tenantId,
    factory_id: factoryId,
    machine_id: machineId,
    metric,
    start: startIso,
    end: endIso,
  };

  const { data: aggData = [], isLoading: aggLoading, error: aggError } = useAgg({ ...queryOptions, window_s: Number(windowS), limit: 1000 }, true);
  const { data: kpiData = [] } = useKpi({ ...queryOptions, period: 'day', limit: 1 }, true);
  const { data: anomalies = [] } = useAnomalies({ ...queryOptions, window_s: Number(windowS), limit: 100 }, true);

  const latestKpi = kpiData[0];
  const isLoading = tenantsLoading || factoriesLoading || machinesLoading || metricsLoading;

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Cloud Analytics</Typography>
            <Typography variant="body2" color="text.secondary">Real-time data streams from cloud-connected sensors.</Typography>
          </Box>
        </Box>

        {health && (
          <Alert severity={health.status === 'healthy' ? 'success' : 'warning'} sx={{ mb: 2 }}>
            Analytics API Status: {health.status} {health.database ? `(Database: ${health.database})` : ''}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}><FormControl fullWidth><InputLabel>Tenant</InputLabel><Select label="Tenant" value={tenantId} onChange={(e) => setTenantId(e.target.value)}>{tenantOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={2.4}><FormControl fullWidth><InputLabel>Factory</InputLabel><Select label="Factory" value={factoryId} onChange={(e) => setFactoryId(e.target.value)}>{factoryOptions.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={2.4}><FormControl fullWidth><InputLabel>Machine</InputLabel><Select label="Machine" value={machineId} onChange={(e) => setMachineId(e.target.value)}>{machineOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={2.4}><FormControl fullWidth><InputLabel>Metric</InputLabel><Select label="Metric" value={metric} onChange={(e) => setMetric(e.target.value)}>{metricOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={2.4}><TextField label="Range (hours)" type="number" fullWidth value={rangeHours} onChange={(e) => setRangeHours(Math.max(1, Number(e.target.value)))} inputProps={{ min: 1 }} /></Grid>
          </Grid>
          {isLoading && <LinearProgress sx={{mt: 2}} />}
        </Paper>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={6} md={3}><KpiCard title="KPI Mean" value={latestKpi?.mean_val?.toFixed(2)} unit={metric} isLoading={!latestKpi} /></Grid>
          <Grid item xs={6} md={3}><KpiCard title="KPI StdDev" value={latestKpi?.stddev_val?.toFixed(2)} isLoading={!latestKpi} /></Grid>
          <Grid item xs={6} md={3}><KpiCard title="Data Points (n)" value={latestKpi?.n} isLoading={!latestKpi} /></Grid>
          <Grid item xs={6} md={3}><KpiCard title="Anomalies" value={anomalies.length} icon={<WarningIcon />} color={anomalies.length > 0 ? 'warning.main' : 'text.primary'} isLoading={!latestKpi} /></Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard title="Live Metric Trend" subheader={`${metric} over the last ${rangeHours} hour(s)`} loading={aggLoading}>
              {aggError ? <Alert severity="error">Failed to load chart data. Please ensure the analytics service is running.</Alert> :
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aggData.map(d => ({ time: new Date(d.bucket_start).toLocaleTimeString(), value: d.avg_val }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="value" strokeWidth={2} stroke={'var(--mui-palette-primary-main)'} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              }
            </ChartCard>
          </Grid>
          <Grid item xs={12}>
            <Paper>
              <Box p={2}>
                 <Typography variant="h6" component="h3" sx={{ fontWeight: 'fontWeightBold' }}>Detected Anomalies</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Rule</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="right">Mean</TableCell>
                      <TableCell align="right">StdDev</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {anomalies.length > 0 ? anomalies.map((a, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{new Date(a.time).toLocaleString()}</TableCell>
                        <TableCell><Chip label={a.rule} size="small" color="warning" variant="outlined" /></TableCell>
                        <TableCell align="right">{a.value.toFixed(2)}</TableCell>
                        <TableCell align="right">{a.mean.toFixed(2)}</TableCell>
                        <TableCell align="right">{a.stddev.toFixed(2)}</TableCell>
                      </TableRow>
                    )) : 
                    <TableRow><TableCell colSpan={5} align="center">No anomalies detected in the selected time range.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
