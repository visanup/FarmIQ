// Performance Metrics Time-Series Chart Component
import React from 'react';
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
  Stack
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
  AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

// Import types from performance service
import { PerformanceMetrics, PerformanceTimeSeriesData } from '../../services/performance/performanceService';

interface PerformanceChartProps {
  data: PerformanceTimeSeriesData;
  title?: string;
  height?: number;
  showSummary?: boolean;
}

// Custom tooltip for performance metrics
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 3
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          วันที่: {format(parseISO(label), 'dd/MM/yyyy')}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography 
            key={index}
            variant="body2" 
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
            {entry.dataKey === 'fcr' ? '' : 
             entry.dataKey === 'survivalRate' ? '%' :
             entry.dataKey === 'avgWeight' ? 'g' :
             entry.dataKey === 'adg' ? 'g/วัน' :
             entry.dataKey === 'sgr' ? '%/วัน' : ''
            }
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Performance Metrics Summary Card
const MetricSummaryCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  improvement?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, unit, improvement, icon, color }) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (!improvement) return <TrendingFlat sx={{ fontSize: 16 }} />;
    if (improvement > 0) return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
    return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
  };
  
  const getTrendColor = () => {
    if (!improvement) return 'text.secondary';
    return improvement > 0 ? 'success.main' : 'error.main';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Box sx={{ color }}>{icon}</Box>
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 700, color }}>
            {value} {unit}
          </Typography>
          
          {improvement !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getTrendIcon()}
              <Typography 
                variant="caption" 
                sx={{ color: getTrendColor(), fontWeight: 600 }}
              >
                {improvement > 0 ? '+' : ''}{improvement}%
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Main Performance Chart Component
const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title = "ตัวชี้วัดประสิทธิภาพการเลี้ยง",
  height = 400,
  showSummary = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Prepare chart data
  const chartData = data.metrics.map(metric => ({
    date: metric.date,
    fcr: metric.fcr,
    adg: metric.adg,
    sgr: metric.sgr,
    survivalRate: metric.survivalRate,
    avgWeight: metric.avgWeight,
    totalBiomass: metric.totalBiomass
  }));

  // Format date for chart display
  const formatXAxisDate = (dateStr: string) => {
    return format(parseISO(dateStr), isMobile ? 'dd/MM' : 'dd/MM/yyyy');
  };

  return (
    <Box>
      {/* Summary Cards */}
      {showSummary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <MetricSummaryCard
              title="FCR เฉลี่ย"
              value={data.summary.avgFCR}
              unit=""
              icon={<TrendingDown />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricSummaryCard
              title="ADG เฉลี่ย"
              value={data.summary.avgADG}
              unit="g/วัน"
              icon={<TrendingUp />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricSummaryCard
              title="SGR เฉลี่ย"
              value={data.summary.avgSGR}
              unit="%/วัน"
              icon={<TrendingUp />}
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricSummaryCard
              title="อัตรารอดตาย"
              value={data.summary.avgSurvivalRate}
              unit="%"
              icon={<TrendingUp />}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>
      )}

      {/* Main Performance Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisDate}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* FCR Line (Lower is better) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="fcr"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="FCR"
              connectNulls={false}
            />
            
            {/* ADG Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="adg"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              name="ADG (g/วัน)"
              connectNulls={false}
            />
            
            {/* SGR Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sgr"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              name="SGR (%/วัน)"
              connectNulls={false}
            />
            
            {/* Survival Rate Area */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="survivalRate"
              stroke={theme.palette.warning.main}
              fill={theme.palette.warning.light}
              fillOpacity={0.3}
              name="อัตรารอดตาย (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      {/* Weight and Biomass Chart */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          น้ำหนักเฉลี่ยและมวลชีวภาพรวม
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisDate}
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Average Weight Bars */}
            <Bar
              yAxisId="left"
              dataKey="avgWeight"
              fill={theme.palette.secondary.main}
              name="น้ำหนักเฉลี่ย (g)"
              opacity={0.8}
            />
            
            {/* Total Biomass Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalBiomass"
              stroke={theme.palette.error.main}
              strokeWidth={3}
              name="มวลชีวภาพรวม (kg)"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default PerformanceChart;