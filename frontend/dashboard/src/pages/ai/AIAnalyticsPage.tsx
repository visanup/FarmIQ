import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useFarms, useAnimals, usePerformanceMetrics } from '../../hooks/useApi';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: farms = [], isLoading: farmsLoading } = useFarms();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: performanceMetrics = [], isLoading: metricsLoading } = usePerformanceMetrics();

  const aiData = generateAIPredictions();
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

  if (farmsLoading || animalsLoading || metricsLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูล AI Analytics...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: 'primary.main'
                }}
              >
                AI Predictive Analytics
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                การวิเคราะห์เชิงทำนายด้วยปัญญาประดิษฐ์ สำหรับการจัดการฟาร์ม
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* AI Status Alert */}
        {aiEnabled && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle>AI กำลังทำงาน</AlertTitle>
            ระบบ AI กำลังวิเคราะห์ข้อมูลและสร้างการทำนายแบบเรียลไทม์
          </Alert>
        )}

        {/* Controls */}
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

        {/* AI Insights */}
        <AIInsights insights={aiInsights} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="การทำนาย FCR & ADG" />
            <Tab label="การกระจายน้ำหนัก" />
            <Tab label="การทำนายสุขภาพ" />
            <Tab label="ประสิทธิภาพโดยรวม" />
          </Tabs>
        </Box>

        {/* Prediction Charts Tab */}
        <TabPanel value={tabValue} index={0}>
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
        </TabPanel>

        {/* Weight Distribution Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              การกระจายน้ำหนัก - กำลังพัฒนา
            </Typography>
          </Box>
        </TabPanel>

        {/* Health Prediction Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              การทำนายสุขภาพ - กำลังพัฒนา
            </Typography>
          </Box>
        </TabPanel>

        {/* Overall Performance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              ประสิทธิภาพโดยรวม - กำลังพัฒนา
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </DashboardLayout>
  );
};

export default AIAnalyticsPage;