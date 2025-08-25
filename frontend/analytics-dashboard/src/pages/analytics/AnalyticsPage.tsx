import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tab,
  Tabs,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';
import { PerformanceChart, AnimalWeightChart, SensorDataChart } from '../../components/charts';
import { performanceService } from '../../services/performance';
import { animalWeightService } from '../../services/weight/animalWeightService';
import { sensorDataService } from '../../services/sensors';

interface AnalyticsMetric {
  id: string;
  name: string;
  customerId: number;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'growth' | 'environment' | 'efficiency';
  icon: React.ReactElement;
  color: string;
}

interface AnalyticsData {
  customerId: number;
  performanceMetrics: any;
  weightData: any;
  sensorData: any;
  summary: {
    totalFarms: number;
    totalAnimals: number;
    averageFCR: number;
    survivalRate: number;
  };
}

// Mock analytics metrics with customer data
const mockAnalyticsMetrics: AnalyticsMetric[] = [
  {
    id: '1',
    name: 'อัตราการแปลงอาหาร (FCR)',
    customerId: 1,
    value: 1.45,
    previousValue: 1.52,
    unit: '',
    trend: 'down', // Lower FCR is better
    category: 'performance',
    icon: <SpeedIcon />,
    color: '#4caf50',
  },
  {
    id: '2',
    name: 'อัตราการเจริญเติบโต (ADG)',
    customerId: 1,
    value: 28.5,
    previousValue: 26.2,
    unit: 'g/วัน',
    trend: 'up',
    category: 'growth',
    icon: <TrendingUpIcon />,
    color: '#2196f3',
  },
  {
    id: '3',
    name: 'อัตราการรอดตาย',
    customerId: 1,
    value: 94.8,
    previousValue: 92.1,
    unit: '%',
    trend: 'up',
    category: 'performance',
    icon: <AssessmentIcon />,
    color: '#ff9800',
  },
  {
    id: '4',
    name: 'ประสิทธิภาพการใช้อาหาร',
    customerId: 2,
    value: 87.3,
    previousValue: 85.1,
    unit: '%',
    trend: 'up',
    category: 'efficiency',
    icon: <BarChartIcon />,
    color: '#9c27b0',
  },
  {
    id: '5',
    name: 'อุณหภูมิเฉลี่ย',
    customerId: 2,
    value: 28.2,
    previousValue: 27.8,
    unit: '°C',
    trend: 'stable',
    category: 'environment',
    icon: <ShowChartIcon />,
    color: '#00bcd4',
  },
];

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Customer filtering for analytics data
  const [allMetrics] = useState<AnalyticsMetric[]>(mockAnalyticsMetrics);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // Filter metrics based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      setMetrics(allMetrics);
    } else if (state.currentCustomer) {
      const customerMetrics = allMetrics.filter(metric => metric.customerId === state.currentCustomer?.id);
      setMetrics(customerMetrics);
    } else {
      setMetrics([]);
    }
  }, [state.currentCustomer, state.isAdmin, allMetrics]);
  
  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!state.currentCustomer && !state.isAdmin) return;
      
      try {
        // Load performance data
        const performanceData = await performanceService.getPerformanceMetrics({
          customerId: state.currentCustomer?.id || 1,
          level: 'overview',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        });
        
        // Load weight data
        const weightData = await animalWeightService.getWeightMeasurements({
          customerId: state.currentCustomer?.id || 1,
          level: 'overview',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        });
        
        // Load sensor data
        const sensorData = await sensorDataService.getSensorData({
          customerId: state.currentCustomer?.id || 1,
          level: 'overview',
          sensorTypes: ['environment'],
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        });
        
        setAnalyticsData({
          customerId: state.currentCustomer?.id || 1,
          performanceMetrics: performanceData,
          weightData,
          sensorData,
          summary: {
            totalFarms: 3,
            totalAnimals: 15000,
            averageFCR: 1.45,
            survivalRate: 94.8,
          }
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };
    
    loadAnalyticsData();
  }, [state.currentCustomer, state.isAdmin, timeRange]);
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
      case 'down':
        return <TrendingUpIcon sx={{ color: theme.palette.error.main, fontSize: 16, transform: 'rotate(180deg)' }} />;
      default:
        return <TimelineIcon sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />;
    }
  };
  
  const getImprovementPercentage = (current: number, previous: number): number => {
    return ((current - previous) / previous) * 100;
  };
  
  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);

  return (
    <Box sx={{ p: 3 }}>
      <CustomerAwarePageHeader
        title="📊 การวิเคราะห์ข้อมูล"
        subtitle="วิเคราะห์ผลการดำเนินงานและแนวโน้มการเจริญเติบโตของฟาร์ม"
        actionButton={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ช่วงเวลา</InputLabel>
              <Select
                value={timeRange}
                label="ช่วงเวลา"
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="7days">7 วันล่าสุด</MenuItem>
                <MenuItem value="30days">30 วันล่าสุด</MenuItem>
                <MenuItem value="3months">3 เดือนล่าสุด</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              sx={{ borderRadius: 2 }}
            >
              ส่งออกรายงาน
            </Button>
          </Box>
        }
        noDataMessage={metrics.length === 0 ? "ไม่พบข้อมูลการวิเคราะห์สำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              กรองข้อมูล:
            </Typography>
            <Chip 
              label="ทั้งหมด" 
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
              color="primary"
            />
            <Chip 
              label="ประสิทธิภาพ" 
              onClick={() => setSelectedCategory('performance')}
              variant={selectedCategory === 'performance' ? 'filled' : 'outlined'}
              color="primary"
            />
            <Chip 
              label="การเจริญเติบโต" 
              onClick={() => setSelectedCategory('growth')}
              variant={selectedCategory === 'growth' ? 'filled' : 'outlined'}
              color="secondary"
            />
            <Chip 
              label="สภาพแวดล้อม" 
              onClick={() => setSelectedCategory('environment')}
              variant={selectedCategory === 'environment' ? 'filled' : 'outlined'}
              color="info"
            />
            <Chip 
              label="ประสิทธิภาพการใช้" 
              onClick={() => setSelectedCategory('efficiency')}
              variant={selectedCategory === 'efficiency' ? 'filled' : 'outlined'}
              color="warning"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredMetrics.map((metric) => {
          const improvement = getImprovementPercentage(metric.value, metric.previousValue);
          return (
            <Grid item xs={12} sm={6} md={4} key={metric.id}>
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${metric.color}20`,
                        color: metric.color,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {metric.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                        {metric.value} {metric.unit}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(metric.trend)}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: improvement > 0 ? theme.palette.success.main : 
                                 improvement < 0 ? theme.palette.error.main : 
                                 theme.palette.text.secondary,
                          fontWeight: 600
                        }}
                      >
                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      เทียบกับเดือนที่แล้ว
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Analytics Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label="📈 ภาพรวมประสิทธิภาพ" />
          <Tab label="📊 การเจริญเติบโต" />
          <Tab label="🌡️ ข้อมูลเซ็นเซอร์" />
          <Tab label="📋 สรุปผล" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>
        {currentTab === 0 && analyticsData?.performanceMetrics && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  🐟 กราฟประสิทธิภาพการเลี้ยง
                </Typography>
                <PerformanceChart data={analyticsData.performanceMetrics} height={400} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {currentTab === 1 && analyticsData?.weightData && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📍 กราฟการเจริญเติบโต
                </Typography>
                <AnimalWeightChart 
                  data={analyticsData.weightData} 
                  height={400} 
                  showProjections={true}
                  showDistribution={true}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {currentTab === 2 && analyticsData?.sensorData && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  🌡️ ข้อมูลเซ็นเซอร์สภาพแวดล้อม
                </Typography>
                <SensorDataChart data={analyticsData.sensorData} height={400} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {currentTab === 3 && analyticsData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📋 สรุปผลการดำเนินงาน
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">จำนวนฟาร์ม:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {analyticsData.summary.totalFarms}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">จำนวนสัตว์:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {analyticsData.summary.totalAnimals.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">อัตราแปลงอาหารเฉลี่ย:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {analyticsData.summary.averageFCR}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">อัตราการรอดตาย:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        {analyticsData.summary.survivalRate}%
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={analyticsData.summary.survivalRate} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    📈 แนวโน้มการปรับปรุง
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ข้อเสนอแนะสำหรับการปรับปรุงประสิทธิภาพ:
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label="เพิ่มความถี่ในการให้อาหาร" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mb: 1, mr: 1 }}
                    />
                    <Chip 
                      label="ตรวจสอบคุณภาพน้ำบ่อยขึ้น" 
                      color="secondary" 
                      variant="outlined" 
                      sx={{ mb: 1, mr: 1 }}
                    />
                    <Chip 
                      label="ปรับปรุงอุณหภูมิโรงเรือน" 
                      color="warning" 
                      variant="outlined" 
                      sx={{ mb: 1, mr: 1 }}
                    />
                    <Chip 
                      label="เพิ่มการตรวจสอบสุขภาพ" 
                      color="success" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    💡 ข้อมูลเหล่านี้จะช่วยให้คุณเพิ่มประสิทธิภาพและลดต้นทุนการดำเนินงาน
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPage;