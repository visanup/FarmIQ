import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Stack,
  LinearProgress,
} from '@mui/material';
import { 
  ComposedChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface PredictionChartsProps {
  aiData: any[];
  weightDistribution: any[];
  healthPredictions: any[];
  performanceRadar: any[];
  currentFCR: number;
  predictedFCR: number;
  currentADG: number;
  predictedADG: number;
  confidence: number;
}

export const PredictionCharts: React.FC<PredictionChartsProps> = ({
  aiData,
  weightDistribution,
  healthPredictions,
  performanceRadar,
  currentFCR,
  predictedFCR,
  currentADG,
  predictedADG,
  confidence,
}) => {
  return (
    <Grid container spacing={3}>
      {/* FCR & ADG Prediction Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              การทำนาย FCR และ ADG
            </Typography>
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={aiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                      tick={{ fontSize: 14, fontWeight: 500 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  yAxisId="left"
                      tick={{ fontSize: 14, fontWeight: 500 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
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
                <ReferenceLine x="30" stroke="#ff9800" strokeDasharray="5 5" />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="actualFCR" 
                  stroke="#2e7d32" 
                  strokeWidth={2}
                  name="FCR จริง"
                  dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="predictedFCR" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="FCR ทำนาย"
                  dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="actualADG" 
                  stroke="#2196f3" 
                  strokeWidth={2}
                  name="ADG จริง"
                  dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="predictedADG" 
                  stroke="#03a9f4" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="ADG ทำนาย"
                  dot={{ fill: '#03a9f4', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              สถิติการทำนาย
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  FCR ปัจจุบัน
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="700">
                  {currentFCR.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FCR ทำนาย: {predictedFCR.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ADG ปัจจุบัน
                </Typography>
                <Typography variant="h4" color="info" fontWeight="700">
                  {currentADG.toFixed(2)} กก./วัน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ADG ทำนาย: {predictedADG.toFixed(2)} กก./วัน
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ความแม่นยำ
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={confidence} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {confidence}% ความเชื่อมั่น
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Weight Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              การกระจายน้ำหนักปัจจุบัน
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weightDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="weight" 
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
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
                <Bar dataKey="count" fill="#2e7d32" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Health Predictions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              การทำนายสุขภาพ
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={healthPredictions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthPredictions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Radar */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ประสิทธิภาพโดยรวม
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={performanceRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar
                  name="ปัจจุบัน"
                  dataKey="A"
                  stroke="#2e7d32"
                  fill="#2e7d32"
                  fillOpacity={0.3}
                />
                <Radar
                  name="เป้าหมาย"
                  dataKey="B"
                  stroke="#4caf50"
                  fill="#4caf50"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Targets */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              เป้าหมาย AI
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  FCR เป้าหมาย
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(currentFCR / 2.0) * 100} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {currentFCR.toFixed(2)} / 2.0
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ADG เป้าหมาย
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(currentADG / 0.8) * 100} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {currentADG.toFixed(2)} / 0.8 กก./วัน
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  อัตราการรอด
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={98} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  98% / 95%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
