import React from 'react';
import {
  Typography,
  Grid,
  Box,
  Stack,
  useTheme,
} from '@mui/material';
import { ChartCard } from '../../dashboard/components/ChartCard';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';

interface RealtimeChartsProps {
  filteredData: any[];
  selectedSensorType: string;
  getSensorColor: (type: string) => string;
}

export const RealtimeCharts: React.FC<RealtimeChartsProps> = ({
  filteredData,
  selectedSensorType,
  getSensorColor,
}) => {
  const theme = useTheme();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <ChartCard title="กราฟข้อมูลเรียลไทม์" dense height={500} contentPadding={12}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fontWeight: 500, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis 
                tick={{ fontSize: 12, fontWeight: 500, fill: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getSensorColor(selectedSensorType)} 
                strokeWidth={3}
                dot={{ fill: getSensorColor(selectedSensorType), strokeWidth: 2, r: 2 }}
                activeDot={{ r: 5, stroke: getSensorColor(selectedSensorType), strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <ChartCard title="สถิติข้อมูล" dense height={500} contentPadding={16}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ค่าเฉลี่ย
              </Typography>
              <Typography variant="h5" color="primary">
                {(filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length || 0).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ค่าสูงสุด
              </Typography>
              <Typography variant="h5" color="error">
                {Math.max(...filteredData.map(d => d.value), 0).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ค่าต่ำสุด
              </Typography>
              <Typography variant="h5" color="info">
                {Math.min(...filteredData.map(d => d.value), 0).toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                จำนวนข้อมูล
              </Typography>
              <Typography variant="h5" color="secondary">
                {filteredData.length}
              </Typography>
            </Box>
          </Stack>
        </ChartCard>
      </Grid>
    </Grid>
  );
};
