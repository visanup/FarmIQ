// Animal Weight Time-Series Chart Component
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
  Stack,
  Alert,
  AlertTitle
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
  AreaChart,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat, 
  Speed,
  Scale,
  Timeline
} from '@mui/icons-material';

// Import types from weight service
import { WeightTimeSeriesData, WeightGrowthAnalysis } from '../../services/weight/animalWeightService';

interface AnimalWeightChartProps {
  data: WeightTimeSeriesData;
  analysis?: WeightGrowthAnalysis;
  title?: string;
  height?: number;
  showProjections?: boolean;
  showDistribution?: boolean;
}

// Custom tooltip for weight data
const WeightTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 3,
          maxWidth: 300
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
            {entry.dataKey.includes('Weight') ? 'g' :
             entry.dataKey === 'uniformity' ? '%' :
             entry.dataKey === 'biomass' ? 'kg' :
             entry.dataKey === 'dailyGrowthRate' ? '%' : ''
            }
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Weight Summary Card
const WeightSummaryCard: React.FC<{
  title: string;
  value: number | string;
  unit: string;
  improvement?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, unit, improvement, icon, color }) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (improvement === undefined) return null;
    if (improvement > 0) return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
    if (improvement < 0) return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
    return <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />;
  };
  
  const getTrendColor = () => {
    if (improvement === undefined) return 'text.secondary';
    return improvement > 0 ? 'success.main' : improvement < 0 ? 'error.main' : 'text.secondary';
  };

  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
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

// Growth Projection Component
const GrowthProjection: React.FC<{ data: WeightTimeSeriesData }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          📈 การคาดการณ์การเจริญเติบโต
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                น้ำหนักเป้าหมาย
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                {data.projections.targetWeight}g
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                วันที่คาดว่าจะถึงเป้า
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                {format(parseISO(data.projections.projectedDate), 'dd/MM/yyyy')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                จำนวนวันที่เหลือ
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                {data.projections.estimatedDays} วัน
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Animal Weight Chart Component
const AnimalWeightChart: React.FC<AnimalWeightChartProps> = ({
  data,
  analysis,
  title = "การเจริญเติบโตของสัตว์",
  height = 400,
  showProjections = true,
  showDistribution = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Prepare chart data
  const chartData = data.measurements.map(measurement => ({
    date: measurement.date,
    averageWeight: measurement.averageWeight,
    minWeight: measurement.minWeight,
    maxWeight: measurement.maxWeight,
    dailyGrowthRate: measurement.dailyGrowthRate,
    cumulativeGrowth: measurement.cumulativeGrowth,
    uniformity: measurement.uniformity,
    biomass: measurement.biomass,
    weightGain: measurement.weightGain
  }));

  // Format date for chart display
  const formatXAxisDate = (dateStr: string) => {
    return format(parseISO(dateStr), isMobile ? 'dd/MM' : 'dd/MM/yyyy');
  };

  // Calculate improvement percentages if analysis is provided
  const improvements = analysis ? {
    weightGain: analysis.comparison.weightGainImprovement,
    growthRate: analysis.comparison.growthRateImprovement,
    uniformity: analysis.comparison.uniformityImprovement,
    feedEfficiency: analysis.comparison.feedEfficiencyImprovement
  } : undefined;

  return (
    <Box>
      {/* Growth Trend Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <WeightSummaryCard
            title="น้ำหนักเฉลี่ย"
            value={data.growthTrend.endWeight}
            unit="g"
            improvement={improvements?.weightGain}
            icon={<Scale />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <WeightSummaryCard
            title="เติบโตต่อวัน"
            value={data.growthTrend.averageDailyGain}
            unit="g/วัน"
            improvement={improvements?.growthRate}
            icon={<Speed />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <WeightSummaryCard
            title="อัตราการเติบโต"
            value={data.growthTrend.growthRate}
            unit="%"
            improvement={improvements?.growthRate}
            icon={<Timeline />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <WeightSummaryCard
            title="การเติบโตรวม"
            value={data.growthTrend.totalGrowth}
            unit="g"
            icon={<TrendingUp />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Growth Projections */}
      {showProjections && <GrowthProjection data={data} />}

      {/* Alerts from Analysis */}
      {analysis?.alerts.map((alert, index) => (
        <Alert 
          key={index}
          severity={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            {alert.type === 'excellent_growth' ? '🎉 ผลการเลี้ยงดีเยี่ยม' : 
             alert.type === 'slow_growth' ? '⚠️ การเจริญเติบโตช้า' :
             alert.type === 'low_uniformity' ? '📊 ความสม่ำเสมอต่ำ' : 'การแจ้งเตือน'}
          </AlertTitle>
          {alert.message}
        </Alert>
      ))}

      {/* Main Weight Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title} - แนวโน้มน้ำหนักและการเจริญเติบโต
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
              yAxisId="weight"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              label={{ value: 'น้ำหนัก (g)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="rate" 
              orientation="right"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              label={{ value: 'อัตรา (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<WeightTooltip />} />
            <Legend />
            
            {/* Weight Range Area */}
            <Area
              yAxisId="weight"
              type="monotone"
              dataKey="maxWeight"
              stroke="none"
              fill={theme.palette.primary.light}
              fillOpacity={0.2}
              name="ช่วงน้ำหนัก"
            />
            <Area
              yAxisId="weight"
              type="monotone"
              dataKey="minWeight"
              stroke="none"
              fill={theme.palette.background.paper}
              fillOpacity={1}
            />
            
            {/* Average Weight Line */}
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="averageWeight"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              name="น้ำหนักเฉลี่ย (g)"
              connectNulls={false}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
            />
            
            {/* Daily Growth Rate */}
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="dailyGrowthRate"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="อัตราเติบโตรายวัน (%)"
              connectNulls={false}
            />
            
            {/* Uniformity */}
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="uniformity"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              name="ความสม่ำเสมอ (%)"
              connectNulls={false}
            />

            {/* Target Weight Reference Line */}
            <ReferenceLine 
              yAxisId="weight"
              y={data.projections.targetWeight} 
              stroke={theme.palette.error.main}
              strokeDasharray="8 8"
              label={{ value: `เป้าหมาย ${data.projections.targetWeight}g`, position: "topLeft" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      {/* Weight Distribution Chart */}
      {showDistribution && data.measurements.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            การกระจายตัวของน้ำหนัก (ข้อมูลล่าสุด)
          </Typography>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={data.measurements[0].weightDistribution}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="range"
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                label={{ value: 'เปอร์เซ็นต์', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'สัดส่วน']}
                labelFormatter={(label) => `ช่วงน้ำหนัก: ${label}`}
              />
              
              <Area
                type="monotone"
                dataKey="percentage"
                stroke={theme.palette.secondary.main}
                fill={theme.palette.secondary.light}
                fillOpacity={0.6}
                name="สัดส่วน (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Growth Statistics */}
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          📊 สถิติการเจริญเติบโต
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                {data.growthTrend.startWeight}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                น้ำหนักเริ่มต้น
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                {data.growthTrend.endWeight}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                น้ำหนักปัจจุบัน
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                {data.growthTrend.averageDailyGain}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เติบโตเฉลี่ยต่อวัน
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                {data.growthTrend.growthRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                อัตราการเติบโต
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AnimalWeightChart;