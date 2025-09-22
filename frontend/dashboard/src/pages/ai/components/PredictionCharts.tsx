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
    <Grid container spacing={4}>
      {/* FCR & ADG Prediction Chart */}
      <Grid item xs={12} xl={8}>
        <Card sx={{ height: '100%', minHeight: 650 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              การทำนาย FCR และ ADG
            </Typography>
            <Box sx={{ flex: 1, minHeight: 550 }}>
              <ResponsiveContainer width="100%" height="100%">
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
                <ReferenceLine x="30" yAxisId="left" stroke="#ff9800" strokeDasharray="5 5" />
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
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} xl={4}>
        <Card sx={{ height: '100%', minHeight: 650 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              สถิติการทำนาย
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack spacing={4}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e8f5e8, #f1f8e9)' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  FCR ปัจจุบัน
                </Typography>
                <Typography variant="h2" color="primary" fontWeight="800" sx={{ mb: 1 }}>
                  {currentFCR.toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  FCR ทำนาย: {predictedFCR.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  ADG ปัจจุบัน
                </Typography>
                <Typography variant="h2" color="info" fontWeight="800" sx={{ mb: 1 }}>
                  {currentADG.toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  กก./วัน
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ADG ทำนาย: {predictedADG.toFixed(2)} กก./วัน
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #fff3e0, #fce4ec)' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  ความแม่นยำ
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={confidence} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6, 
                    mb: 2,
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                      borderRadius: 6
                    }
                  }}
                />
                <Typography variant="h4" color="success" fontWeight="700">
                  {confidence}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ความเชื่อมั่น
                </Typography>
              </Box>
            </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Weight Distribution */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', minHeight: 550 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              การกระจายน้ำหนักปัจจุบัน
            </Typography>
            <Box sx={{ flex: 1, minHeight: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Health Predictions */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', minHeight: 550 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              การทำนายสุขภาพ
            </Typography>
            <Box sx={{ flex: 1, minHeight: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Radar */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', minHeight: 550 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              ประสิทธิภาพโดยรวม
            </Typography>
            <Box sx={{ flex: 1, minHeight: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* AI Targets */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', minHeight: 550 }}>
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              เป้าหมาย AI
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e8f5e8, #f1f8e9)', border: '2px solid #4CAF50' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  FCR เป้าหมาย
                </Typography>
                <Typography variant="h3" color="primary" fontWeight="800" sx={{ mb: 2 }}>
                  {currentFCR.toFixed(2)} / 2.0
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((currentFCR / 2.0) * 100, 100)} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: currentFCR <= 2.0 ? 'linear-gradient(90deg, #4CAF50, #45a049)' : 'linear-gradient(90deg, #ff9800, #f57c00)',
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  {currentFCR <= 2.0 ? '✅ เป้าหมายสำเร็จ' : '⚠️ เกินเป้าหมาย'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)', border: '2px solid #2196F3' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  ADG เป้าหมาย
                </Typography>
                <Typography variant="h3" color="info" fontWeight="800" sx={{ mb: 2 }}>
                  {currentADG.toFixed(2)} / 0.8
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                  กก./วัน
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((currentADG / 0.8) * 100, 100)} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: currentADG >= 0.8 ? 'linear-gradient(90deg, #4CAF50, #45a049)' : 'linear-gradient(90deg, #ff9800, #f57c00)',
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  {currentADG >= 0.8 ? '✅ เป้าหมายสำเร็จ' : '⚠️ ต่ำกว่าเป้าหมาย'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #fff3e0, #fce4ec)', border: '2px solid #FF9800' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  อัตราการรอด
                </Typography>
                <Typography variant="h3" color="warning" fontWeight="800" sx={{ mb: 2 }}>
                  98% / 95%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={98} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                  ✅ เป้าหมายสำเร็จ
                </Typography>
              </Box>
            </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
