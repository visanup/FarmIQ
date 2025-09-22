import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Fade,
  Zoom,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAIData } from '../../hooks/useAIData';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';
import { AIControls } from './components/AIControls';
import { AIInsights } from './components/AIInsights';
import { PredictionCharts } from './components/PredictionCharts';

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
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// AI Prediction Data Generator
const generateAIPredictions = () => {
  const data = [];
  const now = new Date();
  
  // Historical data (past 30 days)
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      actualFCR: 1.8 + Math.random() * 0.4 + Math.sin(i * 0.1) * 0.1,
      predictedFCR: 1.8 + Math.random() * 0.4 + Math.sin(i * 0.1) * 0.1,
      actualADG: 0.6 + Math.random() * 0.2 + Math.cos(i * 0.15) * 0.05,
      predictedADG: 0.6 + Math.random() * 0.2 + Math.cos(i * 0.15) * 0.05,
      actualWeight: 50 + i * 2 + Math.random() * 5 + Math.sin(i * 0.2) * 2,
      predictedWeight: 50 + i * 2 + Math.random() * 5 + Math.sin(i * 0.2) * 2,
      temperature: 25 + Math.random() * 5 + Math.sin(i * 0.1) * 2,
      humidity: 60 + Math.random() * 20 + Math.cos(i * 0.2) * 10,
      feedIntake: 2.5 + Math.random() * 0.5 + Math.sin(i * 0.1) * 0.1,
      waterIntake: 4.0 + Math.random() * 1.0 + Math.cos(i * 0.15) * 0.2,
    });
  }
  
  // Future predictions (next 30 days)
  for (let i = 1; i <= 30; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
      actualFCR: null,
      predictedFCR: 1.7 + Math.random() * 0.3 + Math.sin(i * 0.1) * 0.1,
      actualADG: null,
      predictedADG: 0.65 + Math.random() * 0.15 + Math.cos(i * 0.15) * 0.05,
      actualWeight: null,
      predictedWeight: 50 + (30 + i) * 2 + Math.random() * 5 + Math.sin(i * 0.2) * 2,
      temperature: 25 + Math.random() * 5 + Math.sin(i * 0.1) * 2,
      humidity: 60 + Math.random() * 20 + Math.cos(i * 0.2) * 10,
      feedIntake: 2.5 + Math.random() * 0.5 + Math.sin(i * 0.1) * 0.1,
      waterIntake: 4.0 + Math.random() * 1.0 + Math.cos(i * 0.15) * 0.2,
      isPrediction: true,
    });
  }
  
  return data;
};

const generateWeightDistribution = () => {
  return [
    { weight: '0-10 กก.', count: 5, color: '#ffeb3b' },
    { weight: '10-20 กก.', count: 12, color: '#ff9800' },
    { weight: '20-30 กก.', count: 25, color: '#4caf50' },
    { weight: '30-40 กก.', count: 18, color: '#2196f3' },
    { weight: '40-50 กก.', count: 8, color: '#9c27b0' },
    { weight: '50+ กก.', count: 2, color: '#f44336' },
  ];
};

const generateHealthPredictions = () => {
  return [
    { name: 'สุขภาพดี', value: 75, color: '#4caf50' },
    { name: 'เสี่ยงป่วย', value: 15, color: '#ff9800' },
    { name: 'ป่วย', value: 8, color: '#f44336' },
    { name: 'ตาย', value: 2, color: '#9e9e9e' },
  ];
};

const generatePerformanceRadar = () => {
  return [
    { subject: 'FCR', A: 85, B: 90, fullMark: 100 },
    { subject: 'ADG', A: 78, B: 85, fullMark: 100 },
    { subject: 'น้ำหนัก', A: 92, B: 88, fullMark: 100 },
    { subject: 'สุขภาพ', A: 88, B: 92, fullMark: 100 },
    { subject: 'การกินอาหาร', A: 75, B: 80, fullMark: 100 },
    { subject: 'การดื่มน้ำ', A: 82, B: 85, fullMark: 100 },
  ];
};

const AIAnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedAnimal, setSelectedAnimal] = useState('all');
  const [predictionHorizon, setPredictionHorizon] = useState(30); // days
  const [aiEnabled, setAiEnabled] = useState(true);
  const [confidence, setConfidence] = useState(85); // %

  // Use custom hook for data fetching
  const { 
    data, 
    isLoading, 
    error, 
    lastUpdate, 
    refresh 
  } = useAIData({
    selectedFarm,
    selectedAnimal,
    predictionHorizon
  });

  const {
    farms,
    animals,
    sensorReadings,
    performanceMetrics,
    aiData
  } = data;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRefresh = () => {
    refresh();
  };

  // Generate AI predictions from real sensor data
  const generateAIPredictionsFromRealData = (readings: any[]) => {
    const data = [];
    const now = new Date();
    
    // Process real sensor data for historical trends
    const temperatureReadings = readings.filter(r => r.sensorType === 'temperature');
    const humidityReadings = readings.filter(r => r.sensorType === 'humidity');
    
    // Calculate baseline metrics from real data
    const avgTemperature = temperatureReadings.length > 0 ? 
      temperatureReadings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / temperatureReadings.length : 25;
    const avgHumidity = humidityReadings.length > 0 ? 
      humidityReadings.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / humidityReadings.length : 60;
    
    // Historical data (past 30 days) - enhanced with real data patterns
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayReadings = readings.filter(r => {
        const readingDate = new Date(r.timestamp);
        return readingDate.toDateString() === date.toDateString();
      });
      
      const dayTemp = dayReadings.filter(r => r.sensorType === 'temperature');
      const dayHumidity = dayReadings.filter(r => r.sensorType === 'humidity');
      
      const actualTemp = dayTemp.length > 0 ? 
        dayTemp.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / dayTemp.length : 
        avgTemperature + Math.sin(i * 0.1) * 2;
      
      const actualHumidity = dayHumidity.length > 0 ? 
        dayHumidity.reduce((sum, r) => sum + (typeof r.value === 'number' ? r.value : 0), 0) / dayHumidity.length : 
        avgHumidity + Math.cos(i * 0.15) * 10;
      
      // Calculate FCR and ADG based on environmental conditions
      const fcrBase = 1.8 + (actualTemp - 25) * 0.02 + (actualHumidity - 60) * 0.001;
      const adgBase = 0.6 + (25 - actualTemp) * 0.01 + (actualHumidity - 60) * 0.0005;
      
      data.push({
        date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        actualFCR: fcrBase + Math.random() * 0.2,
        predictedFCR: fcrBase + Math.random() * 0.2,
        actualADG: adgBase + Math.random() * 0.1,
        predictedADG: adgBase + Math.random() * 0.1,
        actualWeight: 50 + i * 2 + Math.random() * 3,
        predictedWeight: 50 + i * 2 + Math.random() * 3,
        temperature: actualTemp,
        humidity: actualHumidity,
        feedIntake: 2.5 + Math.random() * 0.3,
        waterIntake: 4.0 + Math.random() * 0.5,
      });
    }
    
    // Future predictions (next 30 days) - based on historical trends
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const trendFactor = Math.sin(i * 0.1) * 0.1;
      
      data.push({
        date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        actualFCR: null,
        predictedFCR: 1.7 + trendFactor + Math.random() * 0.2,
        actualADG: null,
        predictedADG: 0.65 + trendFactor + Math.random() * 0.1,
        actualWeight: null,
        predictedWeight: 50 + (30 + i) * 2 + trendFactor * 2,
        temperature: avgTemperature + Math.sin(i * 0.1) * 3,
        humidity: avgHumidity + Math.cos(i * 0.15) * 15,
        feedIntake: 2.5 + Math.random() * 0.3,
        waterIntake: 4.0 + Math.random() * 0.5,
        isPrediction: true,
      });
    }
    
    return data;
  };


  const weightDistribution = generateWeightDistribution();
  const healthPredictions = generateHealthPredictions();
  const performanceRadar = generatePerformanceRadar();

  // Calculate AI insights
  const currentFCR = aiData[30]?.predictedFCR || 0;
  const predictedFCR = aiData[60]?.predictedFCR || 0;
  const fcrImprovement = ((currentFCR - predictedFCR) / currentFCR) * 100;

  const currentADG = aiData[30]?.predictedADG || 0;
  const predictedADG = aiData[60]?.predictedADG || 0;
  const adgImprovement = ((predictedADG - currentADG) / currentADG) * 100;

  const currentWeight = aiData[30]?.predictedWeight || 0;
  const predictedWeight = aiData[60]?.predictedWeight || 0;
  const weightGain = predictedWeight - currentWeight;

  const aiInsights = [
    {
      id: 1,
      type: 'success' as const,
      title: 'FCR จะดีขึ้น',
      description: `FCR คาดว่าจะลดลง ${fcrImprovement.toFixed(1)}% ใน 30 วันข้างหน้า`,
      confidence: 92,
      impact: 'สูง',
    },
    {
      id: 2,
      type: 'info' as const,
      title: 'ADG เพิ่มขึ้น',
      description: `อัตราการเติบโตคาดว่าจะเพิ่มขึ้น ${adgImprovement.toFixed(1)}%`,
      confidence: 88,
      impact: 'ปานกลาง',
    },
    {
      id: 3,
      type: 'warning' as const,
      title: 'น้ำหนักเพิ่มขึ้น',
      description: `น้ำหนักเฉลี่ยคาดว่าจะเพิ่มขึ้น ${weightGain.toFixed(1)} กก.`,
      confidence: 85,
      impact: 'สูง',
    },
    {
      id: 4,
      type: 'error' as const,
      title: 'ความเสี่ยงสุขภาพ',
      description: 'สัตว์ 15% มีความเสี่ยงที่จะป่วยใน 7 วันข้างหน้า',
      confidence: 78,
      impact: 'สูง',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="500px"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 6,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            filter: 'blur(40px)' 
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: -30, 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.08)', 
            filter: 'blur(30px)' 
          }} />
          
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.4)'
              }}>
                <PsychologyIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 2, 
                background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                AI Predictive Analytics
              </Typography>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                กำลังวิเคราะห์ข้อมูลด้วย AI...
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <LinearProgress 
                  sx={{ 
                    width: 200, 
                    height: 8, 
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #9C27B0, #673AB7)',
                      borderRadius: 4
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  กรุณารอสักครู่
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Premium Hero Header */}
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${alpha('#9C27B0', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.08)} 0%, ${alpha('#673AB7', 0.05)} 100%)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              right: -60, 
              top: -60, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: `radial-gradient(circle, ${alpha('#9C27B0', 0.1)} 0%, transparent 70%)`,
              filter: 'blur(40px)'
            }} />
            <Box sx={{ 
              position: 'absolute', 
              right: 60, 
              bottom: -80, 
              width: 350, 
              height: 350, 
              borderRadius: '50%', 
              background: `radial-gradient(circle, ${alpha('#673AB7', 0.08)} 0%, transparent 70%)`,
              filter: 'blur(50px)'
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  mb: 2, 
                  px: 2, 
                  py: 1, 
                  borderRadius: 999, 
                  background: `linear-gradient(135deg, #9C27B0, #673AB7)`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha('#9C27B0', 0.4)}`
                }}>
                  <PsychologyIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    AI Predictive Analytics
                  </Typography>
                </Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: -0.5,
                  background: `linear-gradient(135deg, #9C27B0, #673AB7)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  AI Predictive Analytics
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
                  การวิเคราะห์เชิงทำนายด้วยปัญญาประดิษฐ์ สำหรับการจัดการฟาร์ม
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.7 }}>
                  อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: aiEnabled ? 'success.main' : 'error.main',
                  width: 48,
                  height: 48
                }}>
                  {aiEnabled ? <CheckCircleIcon /> : <ErrorIcon />}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    AI Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {aiEnabled ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Fade>

        {/* AI Status Alert */}
        <Fade in timeout={1200}>
          <Alert 
            severity={aiEnabled ? "success" : "warning"}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(aiEnabled ? '#4CAF50' : '#FF9800', 0.3)}`,
              background: `linear-gradient(135deg, ${alpha(aiEnabled ? '#4CAF50' : '#FF9800', 0.1)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color={aiEnabled ? "success" : "warning"} />
              {aiEnabled ? 'AI กำลังทำงาน' : 'AI ถูกปิดใช้งาน'}
            </AlertTitle>
            {aiEnabled 
              ? 'ระบบ AI กำลังวิเคราะห์ข้อมูลและสร้างการทำนายแบบเรียลไทม์'
              : 'กรุณาเปิดใช้งาน AI เพื่อเริ่มการวิเคราะห์และทำนาย'
            }
          </Alert>
        </Fade>

        {/* Enhanced Controls */}
        <Fade in timeout={1400}>
          <Box>
            <AIControls
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              selectedAnimal={selectedAnimal}
              setSelectedAnimal={setSelectedAnimal}
              predictionHorizon={predictionHorizon}
              setPredictionHorizon={setPredictionHorizon}
              aiEnabled={aiEnabled}
              setAiEnabled={setAiEnabled}
              confidence={confidence}
              setConfidence={setConfidence}
              farms={farms}
              animals={animals}
            />
          </Box>
        </Fade>

        {/* AI Insights */}
        <Fade in timeout={1600}>
          <Box>
            <AIInsights insights={aiInsights} />
          </Box>
        </Fade>

        {/* Enhanced Tabs */}
        <Fade in timeout={1800}>
          <Card elevation={0} sx={{ 
            mb: 3, 
            borderRadius: 3, 
            border: `1px solid ${alpha('#9C27B0', 0.2)}`,
            background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 60,
                    '&.Mui-selected': {
                      color: '#9C27B0',
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#9C27B0',
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon fontSize="small" />
                      การทำนาย FCR & ADG
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon fontSize="small" />
                      การกระจายน้ำหนัก
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" />
                      การทำนายสุขภาพ
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon fontSize="small" />
                      ประสิทธิภาพโดยรวม
                    </Box>
                  } 
                />
              </Tabs>
            </Box>
          </Card>
        </Fade>

        {/* Prediction Charts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Zoom in timeout={1000}>
            <Box>
              <PredictionCharts
                aiData={aiData}
                weightDistribution={weightDistribution}
                healthPredictions={healthPredictions}
                performanceRadar={performanceRadar}
                currentFCR={currentFCR}
                predictedFCR={predictedFCR}
                currentADG={currentADG}
                predictedADG={predictedADG}
                confidence={confidence}
              />
            </Box>
          </Zoom>
        </TabPanel>

        {/* Weight Distribution Tab */}
        <TabPanel value={tabValue} index={1}>
          <Zoom in timeout={1000}>
            <Card elevation={0} sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              border: `1px solid ${alpha('#9C27B0', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
              backdropFilter: 'blur(10px)'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                mx: 'auto',
                background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.4)'
              }}>
                <AssessmentIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                background: `linear-gradient(135deg, #9C27B0, #673AB7)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                การกระจายน้ำหนัก
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                กำลังพัฒนา
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ฟีเจอร์นี้จะแสดงการกระจายน้ำหนักของสัตว์ในฟาร์ม
              </Typography>
            </Card>
          </Zoom>
        </TabPanel>

        {/* Health Prediction Tab */}
        <TabPanel value={tabValue} index={2}>
          <Zoom in timeout={1000}>
            <Card elevation={0} sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              border: `1px solid ${alpha('#4CAF50', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
              backdropFilter: 'blur(10px)'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                mx: 'auto',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)'
              }}>
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                background: `linear-gradient(135deg, #4CAF50, #45a049)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                การทำนายสุขภาพ
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                กำลังพัฒนา
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ฟีเจอร์นี้จะทำนายสุขภาพของสัตว์และแจ้งเตือนความเสี่ยง
              </Typography>
            </Card>
          </Zoom>
        </TabPanel>

        {/* Overall Performance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Zoom in timeout={1000}>
            <Card elevation={0} sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              border: `1px solid ${alpha('#2196F3', 0.2)}`,
              background: `linear-gradient(135deg, ${alpha('#2196F3', 0.05)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
              backdropFilter: 'blur(10px)'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                mx: 'auto',
                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)'
              }}>
                <TimelineIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                background: `linear-gradient(135deg, #2196F3, #1976D2)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ประสิทธิภาพโดยรวม
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                กำลังพัฒนา
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ฟีเจอร์นี้จะแสดงประสิทธิภาพโดยรวมของฟาร์มและเปรียบเทียบกับเป้าหมาย
              </Typography>
            </Card>
          </Zoom>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
};

export default AIAnalyticsPage;