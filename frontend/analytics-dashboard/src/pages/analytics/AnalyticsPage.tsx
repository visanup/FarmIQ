import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Agriculture as AgricultureIcon,
  Scale as ScaleIcon,
  WaterDrop as WaterDropIcon,
  Thermostat as TemperatureIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { usePerformanceMetrics, useHealthRecords, useAnimals } from '../../hooks/useApi';
import { PerformanceMetric, HealthRecord, Animal } from '../../types/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const { data: performanceMetrics = [], isLoading: metricsLoading } = usePerformanceMetrics();
  const { data: healthRecords = [], isLoading: healthLoading } = useHealthRecords();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();

  // Generate comprehensive mock analytics data
  const generatePerformanceData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        milkProduction: 20 + Math.random() * 10 + Math.sin(i * 0.2) * 3,
        eggProduction: 0.8 + Math.random() * 0.3 + Math.cos(i * 0.3) * 0.1,
        weightGain: 0.5 + Math.random() * 0.3 + Math.sin(i * 0.1) * 0.1,
        feedConsumption: 15 + Math.random() * 5 + Math.cos(i * 0.15) * 2,
        temperature: 25 + Math.random() * 5 + Math.sin(i * 0.1) * 2,
        humidity: 60 + Math.random() * 20 + Math.cos(i * 0.2) * 10,
        healthScore: 85 + Math.random() * 10 + Math.sin(i * 0.05) * 5,
      });
    }
    
    return data;
  };

  const generateHealthData = () => {
    return [
      { name: 'สุขภาพดี', value: 75, color: '#4caf50' },
      { name: 'ป่วยเล็กน้อย', value: 15, color: '#ff9800' },
      { name: 'ป่วยหนัก', value: 8, color: '#f44336' },
      { name: 'ตาย', value: 2, color: '#9e9e9e' },
    ];
  };

  const generateWeightData = () => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        age: i * 30, // days
        weight: 50 + i * 15 + Math.random() * 10,
        expected: 50 + i * 15,
      });
    }
    return data;
  };

  const generateRadarData = () => {
    return [
      { subject: 'การผลิต', A: 120, B: 110, fullMark: 150 },
      { subject: 'สุขภาพ', A: 98, B: 130, fullMark: 150 },
      { subject: 'คุณภาพ', A: 86, B: 130, fullMark: 150 },
      { subject: 'ประสิทธิภาพ', A: 99, B: 100, fullMark: 150 },
      { subject: 'ความปลอดภัย', A: 85, B: 90, fullMark: 150 },
      { subject: 'การจัดการ', A: 65, B: 85, fullMark: 150 },
    ];
  };

  const generateFunnelData = () => {
    return [
      { name: 'ลูกค้าที่สนใจ', value: 100, fill: '#8884d8' },
      { name: 'ลูกค้าที่ติดต่อ', value: 80, fill: '#83a6ed' },
      { name: 'ลูกค้าที่ทดลอง', value: 50, fill: '#8dd1e1' },
      { name: 'ลูกค้าที่ซื้อ', value: 30, fill: '#82ca9d' },
      { name: 'ลูกค้าที่ต่ออายุ', value: 20, fill: '#a4de6c' },
    ];
  };

  const generateRadialData = () => {
    return [
      { name: 'ประสิทธิภาพ', value: 85, fill: '#4caf50' },
      { name: 'คุณภาพ', value: 78, fill: '#2196f3' },
      { name: 'ความปลอดภัย', value: 92, fill: '#ff9800' },
      { name: 'การจัดการ', value: 65, fill: '#f44336' },
    ];
  };

  const performanceData = generatePerformanceData();
  const healthData = generateHealthData();
  const weightData = generateWeightData();

  // Calculate statistics
  const totalAnimals = animals.length;
  const healthyAnimals = healthRecords.filter(r => r.type === 'checkup').length;
  const sickAnimals = healthRecords.filter(r => r.type === 'treatment').length;
  const vaccinationRate = (healthRecords.filter(r => r.type === 'vaccination').length / totalAnimals) * 100;

  const averageMilkProduction = performanceMetrics
    .filter(m => m.metric === 'milk_production')
    .reduce((sum, m) => sum + m.value, 0) / performanceMetrics.filter(m => m.metric === 'milk_production').length || 0;

  const averageEggProduction = performanceMetrics
    .filter(m => m.metric === 'egg_production')
    .reduce((sum, m) => sum + m.value, 0) / performanceMetrics.filter(m => m.metric === 'egg_production').length || 0;

  if (metricsLoading || healthLoading || animalsLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลการวิเคราะห์...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              การวิเคราะห์ข้อมูล
            </Typography>
            <Typography variant="body1" color="text.secondary">
              วิเคราะห์ประสิทธิภาพและสุขภาพของสัตว์ในฟาร์ม
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ฟาร์ม</InputLabel>
              <Select
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                label="ฟาร์ม"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="farm-1">ฟาร์มโคนม</MenuItem>
                <MenuItem value="farm-2">ฟาร์มไก่ไข่</MenuItem>
                <MenuItem value="farm-3">ฟาร์มหมู</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ช่วงเวลา</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="ช่วงเวลา"
              >
                <MenuItem value="7d">7 วัน</MenuItem>
                <MenuItem value="30d">30 วัน</MenuItem>
                <MenuItem value="90d">90 วัน</MenuItem>
                <MenuItem value="1y">1 ปี</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AgricultureIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{totalAnimals}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      สัตว์ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{healthyAnimals}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      สุขภาพดี
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrendingDownIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{sickAnimals}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ป่วย
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{vaccinationRate.toFixed(1)}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      อัตราวัคซีน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="ประสิทธิภาพ" />
              <Tab label="สุขภาพ" />
              <Tab label="น้ำหนัก" />
              <Tab label="การผลิต" />
            </Tabs>
          </Box>

          {/* Performance Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      การผลิตนม 30 วัน
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="milkProduction" 
                          stroke="#2e7d32" 
                          fill="#2e7d32"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      สถิติการผลิต
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        การผลิตนมเฉลี่ย
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {averageMilkProduction.toFixed(1)} ลิตร/วัน
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        การผลิตไข่เฉลี่ย
                      </Typography>
                      <Typography variant="h5" color="secondary">
                        {averageEggProduction.toFixed(2)} ฟอง/วัน
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        การเติบโต
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        75% ของเป้าหมาย
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Health Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      สถานะสุขภาพ
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={healthData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {healthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      บันทึกสุขภาพล่าสุด
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>วันที่</TableCell>
                            <TableCell>ประเภท</TableCell>
                            <TableCell>สถานะ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {healthRecords.slice(0, 5).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                {new Date(record.date).toLocaleDateString('th-TH')}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={record.type === 'vaccination' ? 'วัคซีน' : 
                                         record.type === 'checkup' ? 'ตรวจสุขภาพ' : 'รักษา'}
                                  size="small"
                                  color={record.type === 'vaccination' ? 'primary' : 
                                         record.type === 'checkup' ? 'success' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {record.description}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Weight Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      การเติบโตของน้ำหนัก
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" name="อายุ (วัน)" />
                        <YAxis dataKey="weight" name="น้ำหนัก (กก.)" />
                        <RechartsTooltip />
                        <Scatter 
                          dataKey="weight" 
                          fill="#2e7d32" 
                          name="น้ำหนักจริง"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expected" 
                          stroke="#ff9800" 
                          strokeWidth={2}
                          name="น้ำหนักเป้าหมาย"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      สถิติน้ำหนัก
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        น้ำหนักเฉลี่ย
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {animals.reduce((sum, animal) => sum + animal.weight, 0) / animals.length || 0} กก.
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        น้ำหนักสูงสุด
                      </Typography>
                      <Typography variant="h5" color="secondary">
                        {Math.max(...animals.map(a => a.weight))} กก.
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        น้ำหนักต่ำสุด
                      </Typography>
                      <Typography variant="h5" color="info">
                        {Math.min(...animals.map(a => a.weight))} กก.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Production Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      การผลิตนม vs ไข่
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={performanceData.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="milkProduction" fill="#2e7d32" name="นม (ลิตร)" />
                        <Bar dataKey="eggProduction" fill="#4caf50" name="ไข่ (ฟอง)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      การบริโภคอาหาร
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={performanceData.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="feedConsumption" 
                          stroke="#ff9800" 
                          strokeWidth={2}
                          name="อาหาร (กก.)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;