import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Stack,
} from '@mui/material';
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
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              กราฟข้อมูลเรียลไทม์
            </Typography>
                <ResponsiveContainer width="100%" height={500}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getSensorColor(selectedSensorType)} 
                  strokeWidth={3}
                  dot={{ fill: getSensorColor(selectedSensorType), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getSensorColor(selectedSensorType), strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              สถิติข้อมูล
            </Typography>
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
