import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  useTheme,
  IconButton,
  CircularProgress,
  Fade,
  Zoom,
  LinearProgress,
  Avatar,
  alpha,
  Alert,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  GetApp as DownloadIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Agriculture as AgricultureIcon,
  Water as WaterIcon,
  Thermostat as ThermostatIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Analytics as AnalyticsIcon,
  DataUsage as DataUsageIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useReportsData } from '../../hooks/useReportsData';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';

interface ReportTemplate {
  id: string;
  name: string;
  customerId: number;
  description: string;
  category: string;
  icon: React.ReactElement;
  lastGenerated?: string;
  size?: string;
  dataAvailable?: boolean;
  recordCount?: number;
}

interface ReportData {
  farms: any[];
  devices: any[];
  sensorReadings: any[];
  performanceMetrics: any[];
  fcrData: any;
  sizeDistribution: any;
  anomalySummary: any;
  lastUpdate: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'รายงานสรุปประสิทธิภาพฟาร์ม',
    customerId: 1,
    description: 'รายงานประสิทธิภาพและตัวชี้วัดหลักของฟาร์ม พร้อมข้อมูล KPI และการวิเคราะห์แนวโน้ม',
    category: 'Performance',
    icon: <TrendingUpIcon />,
    lastGenerated: '2024-01-15',
    size: '2.3 MB',
    dataAvailable: true,
    recordCount: 1250,
  },
  {
    id: '2',
    name: 'การวิเคราะห์ผลผลิตและ FCR',
    customerId: 1,
    description: 'การวิเคราะห์ผลผลิตโดยละเอียดตามฤดูกาล พร้อมการคำนวณ FCR และ ADG',
    category: 'Agriculture',
    icon: <AgricultureIcon />,
    lastGenerated: '2024-01-10',
    size: '4.1 MB',
    dataAvailable: true,
    recordCount: 890,
  },
  {
    id: '3',
    name: 'รายงานการใช้น้ำและทรัพยากร',
    customerId: 2,
    description: 'รายงานการใช้น้ำและประสิทธิภาพการใช้น้ำ พร้อมการวิเคราะห์การประหยัด',
    category: 'Resources',
    icon: <WaterIcon />,
    lastGenerated: '2024-01-12',
    size: '1.8 MB',
    dataAvailable: true,
    recordCount: 456,
  },
  {
    id: '4',
    name: 'อุณหภูมิและสภาพอากาศ',
    customerId: 1,
    description: 'สภาพแวดล้อมและผลกระทบต่อการเลี้ยง พร้อมการพยากรณ์อากาศ',
    category: 'Environment',
    icon: <ThermostatIcon />,
    lastGenerated: '2024-01-08',
    size: '3.2 MB',
    dataAvailable: true,
    recordCount: 2100,
  },
  {
    id: '5',
    name: 'การวิเคราะห์ทางการเงิน',
    customerId: 2,
    description: 'การวิเคราะห์ต้นทุนและผลกำไร พร้อมการคำนวณ ROI และ Break-even',
    category: 'Finance',
    icon: <AssessmentIcon />,
    lastGenerated: '2024-01-14',
    size: '2.7 MB',
    dataAvailable: true,
    recordCount: 340,
  },
  {
    id: '6',
    name: 'รายงานสุขภาพอุปกรณ์ IoT',
    customerId: 1,
    description: 'สถานะอุปกรณ์ IoT และตารางบำรุงรักษา พร้อมการแจ้งเตือน',
    category: 'Maintenance',
    icon: <ScheduleIcon />,
    lastGenerated: '2024-01-13',
    size: '1.5 MB',
    dataAvailable: true,
    recordCount: 78,
  },
  {
    id: '7',
    name: 'รายงานการเจริญเติบโตและน้ำหนัก',
    customerId: 2,
    description: 'การติดตามการเจริญเติบโตของสัตว์ พร้อมการกระจายน้ำหนัก',
    category: 'Performance',
    icon: <TrendingUpIcon />,
    lastGenerated: '2024-01-11',
    size: '2.9 MB',
    dataAvailable: true,
    recordCount: 1560,
  },
  {
    id: '8',
    name: 'รายงาน AI และการทำนาย',
    customerId: 1,
    description: 'การวิเคราะห์ด้วย AI และการทำนายผลผลิต พร้อมความแม่นยำ',
    category: 'AI',
    icon: <PsychologyIcon />,
    lastGenerated: '2024-01-16',
    size: '3.8 MB',
    dataAvailable: true,
    recordCount: 2340,
  },
  {
    id: '9',
    name: 'รายงานการตรวจจับความผิดปกติ',
    customerId: 2,
    description: 'การตรวจจับความผิดปกติในข้อมูลและระบบ พร้อมการแจ้งเตือน',
    category: 'Analytics',
    icon: <AnalyticsIcon />,
    lastGenerated: '2024-01-09',
    size: '1.2 MB',
    dataAvailable: true,
    recordCount: 45,
  },
];

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [dateRange, setDateRange] = useState('last30days');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Customer filtering for reports
  const [allReports] = useState<ReportTemplate[]>(reportTemplates);
  const [reports, setReports] = useState<ReportTemplate[]>(allReports);
  
  // Use custom hook for data fetching
  const { 
    data: reportData, 
    isLoading, 
    error, 
    lastUpdate, 
    refresh 
  } = useReportsData();

  const categories = ['ทั้งหมด', 'Performance', 'Agriculture', 'Resources', 'Environment', 'Finance', 'Maintenance', 'AI', 'Analytics'];

  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Performance: theme.palette.primary.main,
      Agriculture: theme.palette.secondary.main,
      Resources: theme.palette.info.main,
      Environment: theme.palette.success.main,
      Finance: theme.palette.warning.main,
      Maintenance: theme.palette.error.main,
      AI: '#9c27b0',
      Analytics: '#ff5722',
    };
    return colors[category] || theme.palette.grey[500];
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      console.log('Generating report:', reportId);
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real implementation, this would call the backend API
      alert(`รายงาน ${reportId} ถูกสร้างเรียบร้อยแล้ว!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
    }
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual file URL
    link.download = `report_${reportId}.pdf`;
    link.click();
  };

  const handleRefresh = () => {
    refresh();
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
        }} />
        <Fade in={true} timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            zIndex: 1,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 4,
            p: 6,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              กำลังโหลดข้อมูลรายงาน...
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              กรุณารอสักครู่ขณะที่เราดึงข้อมูลล่าสุด
            </Typography>
            <LinearProgress 
              sx={{ 
                mt: 3, 
                height: 6, 
                borderRadius: 3,
                background: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: 3
                }
              }} 
            />
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}>
        <Fade in={true} timeout={800}>
          <Box>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }} />
              <Box sx={{ zIndex: 1 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  📊 รายงานและการวิเคราะห์
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  opacity: 0.9
                }}>
                  สร้างรายงานและข้อมูลเชิงลึกที่ครอบคลุมสำหรับการดำเนินงานฟาร์ม
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, zIndex: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  sx={{ 
                    borderRadius: 3,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    }
                  }}
                >
                  รีเฟรช
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  สร้างรายงานกำหนดเอง
                </Button>
              </Box>
            </Box>
          </Box>


          {/* Data Status Alert */}
          {reportData && (
            <Fade in={true} timeout={600}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  '& .MuiAlert-icon': {
                    color: 'success.main'
                  }
                }}
                icon={<CheckCircleIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ข้อมูลอัปเดตล่าสุด: {lastUpdate}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  ฟาร์ม: {reportData.farms.length} | อุปกรณ์: {reportData.devices.length} | ข้อมูลเซ็นเซอร์: {reportData.sensorReadings.length}
                </Typography>
              </Alert>
            </Fade>
          )}

          {/* Error Alert */}
          {error && (
            <Fade in={true} timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  '& .MuiAlert-icon': {
                    color: 'error.main'
                  }
                }}
                icon={<WarningIcon />}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
                </Typography>
              </Alert>
            </Fade>
          )}

          {/* Filters and Controls */}
          <Zoom in={true} timeout={800}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2, 
                    width: 40, 
                    height: 40,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <FilterIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    ตัวกรองและควบคุม
                  </Typography>
                </Box>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="ค้นหารายงาน"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255,255,255,1)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                          }
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>หมวดหมู่</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="หมวดหมู่"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255,255,255,1)',
                          }
                        }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>ช่วงเวลา</InputLabel>
                      <Select
                        value={dateRange}
                        label="ช่วงเวลา"
                        onChange={(e) => setDateRange(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255,255,255,1)',
                          }
                        }}
                      >
                        <MenuItem value="last7days">7 วันล่าสุด</MenuItem>
                        <MenuItem value="last30days">30 วันล่าสุด</MenuItem>
                        <MenuItem value="last90days">90 วันล่าสุด</MenuItem>
                        <MenuItem value="custom">กำหนดเอง</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      sx={{ 
                        height: 56,
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'primary.dark',
                          backgroundColor: 'primary.light',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        }
                      }}
                    >
                      ตัวกรองขั้นสูง
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Zoom>

          <Grid container spacing={4}>
            {/* Report Templates */}
            <Grid item xs={12} lg={8}>
              <Fade in={true} timeout={1000}>
                <Card sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }} />
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2, 
                        width: 40, 
                        height: 40,
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}>
                        <AssessmentIcon />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        รายงานที่มี
                      </Typography>
                      <Chip 
                        label={`${filteredReports.length} รายการ`}
                        sx={{ 
                          ml: 'auto',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Grid container spacing={3}>
                      {filteredReports.map((report, index) => (
                        <Grid item xs={12} sm={6} key={report.id}>
                          <Zoom in={true} timeout={800 + index * 100}>
                            <Card
                              sx={{
                                height: '100%',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-8px) scale(1.02)',
                                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                  borderColor: getCategoryColor(report.category),
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '3px',
                                  background: `linear-gradient(90deg, ${getCategoryColor(report.category)} 0%, ${alpha(getCategoryColor(report.category), 0.6)} 100%)`,
                                }
                              }}
                            >
                              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      backgroundColor: `${getCategoryColor(report.category)}20`,
                                      color: getCategoryColor(report.category),
                                      mr: 2,
                                      boxShadow: `0 4px 12px ${alpha(getCategoryColor(report.category), 0.3)}`,
                                    }}
                                  >
                                    {report.icon}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                      {report.name}
                                    </Typography>
                                    <Chip
                                      label={report.category}
                                      size="small"
                                      sx={{
                                        backgroundColor: `${getCategoryColor(report.category)}20`,
                                        color: getCategoryColor(report.category),
                                        fontWeight: 600,
                                        borderRadius: 2,
                                      }}
                                    />
                                  </Box>
                                </Box>
                                
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 3, lineHeight: 1.6, flex: 1 }}
                                >
                                  {report.description}
                                </Typography>
                                
                                {report.dataAvailable && (
                                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16, mr: 1 }} />
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        ข้อมูลพร้อมใช้งาน
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {report.recordCount?.toLocaleString()} รายการ | อัปเดต: {report.lastGenerated}
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AssessmentIcon />}
                                    onClick={() => handleGenerateReport(report.id)}
                                    sx={{ 
                                      borderRadius: 2, 
                                      flex: 1,
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                      }
                                    }}
                                  >
                                    สร้างรายงาน
                                  </Button>
                                  {report.lastGenerated && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDownloadReport(report.id)}
                                      sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        '&:hover': {
                                          backgroundColor: 'primary.light',
                                          borderColor: 'primary.main',
                                          color: 'primary.main',
                                        }
                                      }}
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Quick Actions & Recent Reports */}
            <Grid item xs={12} lg={4}>
              {/* Quick Actions */}
              <Fade in={true} timeout={1200}>
                <Card sx={{ 
                  mb: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)'
                  }} />
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'success.main', 
                        mr: 2, 
                        width: 40, 
                        height: 40,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                      }}>
                        <SpeedIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        การดำเนินการด่วน
                      </Typography>
                    </Box>
                    <List disablePadding>
                      <ListItemButton
                        sx={{
                          borderRadius: 3,
                          mb: 2,
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <BarChartIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="สร้างรายงานกำหนดเอง"
                          secondary="สร้างรายงานตามความต้องการ"
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItemButton>
                      
                      <ListItemButton
                        sx={{
                          borderRadius: 3,
                          mb: 2,
                          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)',
                          border: '1px solid rgba(156, 39, 176, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(156, 39, 176, 0.2)',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <ScheduleIcon sx={{ color: 'secondary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="กำหนดตารางรายงาน"
                          secondary="สร้างรายงานอัตโนมัติ"
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItemButton>
                      
                      <ListItemButton
                        sx={{
                          borderRadius: 3,
                          mb: 2,
                          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 169, 244, 0.1) 100%)',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <DateRangeIcon sx={{ color: 'info.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="ข้อมูลย้อนหลัง"
                          secondary="เข้าถึงรายงานที่เก็บไว้"
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItemButton>
                    </List>
                  </CardContent>
                </Card>
              </Fade>

              {/* Chart Types */}
              <Fade in={true} timeout={1400}>
                <Card sx={{
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #FF9800 0%, #F57C00 100%)'
                  }} />
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'warning.main', 
                        mr: 2, 
                        width: 40, 
                        height: 40,
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                      }}>
                        <DataUsageIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        ตัวเลือกการแสดงผล
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ShowChartIcon />}
                        sx={{ 
                          borderRadius: 3, 
                          justifyContent: 'flex-start',
                          height: 48,
                          fontWeight: 600,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            borderColor: 'primary.dark',
                            backgroundColor: 'primary.light',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          }
                        }}
                      >
                        กราฟเส้น
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BarChartIcon />}
                        sx={{ 
                          borderRadius: 3, 
                          justifyContent: 'flex-start',
                          height: 48,
                          fontWeight: 600,
                          borderColor: 'secondary.main',
                          color: 'secondary.main',
                          '&:hover': {
                            borderColor: 'secondary.dark',
                            backgroundColor: 'secondary.light',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                          }
                        }}
                      >
                        กราฟแท่ง
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PieChartIcon />}
                        sx={{ 
                          borderRadius: 3, 
                          justifyContent: 'flex-start',
                          height: 48,
                          fontWeight: 600,
                          borderColor: 'success.main',
                          color: 'success.main',
                          '&:hover': {
                            borderColor: 'success.dark',
                            backgroundColor: 'success.light',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          }
                        }}
                      >
                        กราฟวงกลม
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AssessmentIcon />}
                        sx={{ 
                          borderRadius: 3, 
                          justifyContent: 'flex-start',
                          height: 48,
                          fontWeight: 600,
                          borderColor: 'info.main',
                          color: 'info.main',
                          '&:hover': {
                            borderColor: 'info.dark',
                            backgroundColor: 'info.light',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                          }
                        }}
                      >
                        ตารางข้อมูล
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
    </DashboardLayout>
  );
};

export default ReportsPage;