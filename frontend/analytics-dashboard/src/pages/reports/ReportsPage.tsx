import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

interface ReportTemplate {
  id: string;
  name: string;
  customerId: number; // Add customer ID for filtering
  description: string;
  category: string;
  icon: React.ReactElement;
  lastGenerated?: string;
  size?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'รายงานสรุปประสิทธิภาพฟาร์ม',
    customerId: 1,
    description: 'รายงานประสิทธิภาพและตัวชี้วัดหลักของฟาร์ม',
    category: 'Performance',
    icon: <TrendingUpIcon />,
    lastGenerated: '2024-01-15',
    size: '2.3 MB',
  },
  {
    id: '2',
    name: 'การวิเคราะห์ผลผลิต',
    customerId: 1,
    description: 'การวิเคราะห์ผลผลิตโดยละเอียดตามฤดูกาล',
    category: 'Agriculture',
    icon: <AgricultureIcon />,
    lastGenerated: '2024-01-10',
    size: '4.1 MB',
  },
  {
    id: '3',
    name: 'รายงานการใช้น้ำ',
    customerId: 2,
    description: 'รายงานการใช้น้ำและประสิทธิภาพการใช้น้ำ',
    category: 'Resources',
    icon: <WaterIcon />,
    lastGenerated: '2024-01-12',
    size: '1.8 MB',
  },
  {
    id: '4',
    name: 'อุณหภูมิและสภาพอากาศ',
    customerId: 1,
    description: 'สภาพแวดล้อมและผลกระทบต่อการเลี้ยง',
    category: 'Environment',
    icon: <ThermostatIcon />,
    lastGenerated: '2024-01-08',
    size: '3.2 MB',
  },
  {
    id: '5',
    name: 'การวิเคราะห์ทางการเงิน',
    customerId: 2,
    description: 'การวิเคราะห์ต้นทุนและผลกำไร',
    category: 'Finance',
    icon: <AssessmentIcon />,
    lastGenerated: '2024-01-14',
    size: '2.7 MB',
  },
  {
    id: '6',
    name: 'รายงานสุขภาพอุปกรณ์',
    customerId: 1,
    description: 'สถานะอุปกรณ์ IoT และตารางบำรุงรักษา',
    category: 'Maintenance',
    icon: <ScheduleIcon />,
    lastGenerated: '2024-01-13',
    size: '1.5 MB',
  },
  {
    id: '7',
    name: 'รายงานการเจริญเติบโต',
    customerId: 2,
    description: 'การติดตามการเจริญเติบโตของสัตว์',
    category: 'Performance',
    icon: <TrendingUpIcon />,
    lastGenerated: '2024-01-11',
    size: '2.9 MB',
  },
];

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('last30days');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Customer filtering for reports
  const [allReports] = useState<ReportTemplate[]>(reportTemplates);
  const [reports, setReports] = useState<ReportTemplate[]>([]);
  
  // Filter reports based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all reports
      setReports(allReports);
    } else if (state.currentCustomer) {
      // Regular customer sees only their reports
      const customerReports = allReports.filter(report => report.customerId === state.currentCustomer?.id);
      setReports(customerReports);
    } else {
      // No access
      setReports([]);
    }
  }, [state.currentCustomer, state.isAdmin, allReports]);

  const categories = ['ทั้งหมด', 'Performance', 'Agriculture', 'Resources', 'Environment', 'Finance', 'Maintenance'];

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
    };
    return colors[category] || theme.palette.grey[500];
  };

  const handleGenerateReport = (reportId: string) => {
    console.log('Generating report:', reportId);
    // Implementation for report generation
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
    // Implementation for report download
  };

  return (
    <Box sx={{ p: 3 }}>
      <CustomerAwarePageHeader
        title="📊 รายงานและการวิเคราะห์"
        subtitle="สร้างรายงานและข้อมูลเชิงลึกที่ครอบคลุมสำหรับการดำเนินงานฟาร์ม"
        actionButton={
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            sx={{ borderRadius: 2 }}
          >
            สร้างรายงานกำหนดเอง
          </Button>
        }
        noDataMessage={reports.length === 0 ? "ไม่พบรายงานสำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Filters and Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ค้นหารายงาน"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
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
                  sx={{ borderRadius: 2 }}
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
                  sx={{ borderRadius: 2 }}
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
                  borderRadius: 2,
                }}
              >
                ตัวกรองขั้นสูง
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Report Templates */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                รายงานที่มี
              </Typography>
              <Grid container spacing={2}>
                {filteredReports.map((report) => (
                  <Grid item xs={12} sm={6} key={report.id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: `${getCategoryColor(report.category)}20`,
                            color: getCategoryColor(report.category),
                            mr: 2,
                          }}
                        >
                          {report.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {report.name}
                          </Typography>
                          <Chip
                            label={report.category}
                            size="small"
                            sx={{
                              backgroundColor: `${getCategoryColor(report.category)}20`,
                              color: getCategoryColor(report.category),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, lineHeight: 1.5 }}
                      >
                        {report.description}
                      </Typography>
                      
                      {report.lastGenerated && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Last generated: {report.lastGenerated}
                          </Typography>
                          {report.size && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              Size: {report.size}
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AssessmentIcon />}
                          onClick={() => handleGenerateReport(report.id)}
                          sx={{ borderRadius: 1.5, flex: 1 }}
                        >
                          สร้างรายงาน
                        </Button>
                        {report.lastGenerated && (
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report.id)}
                            sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1.5,
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Recent Reports */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                การดำเนินการด่วน
              </Typography>
              <List disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: theme.palette.action.hover,
                  }}
                >
                  <ListItemIcon>
                    <BarChartIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="สร้างรายงานกำหนดเอง"
                    secondary="สร้างรายงานตามความต้องการ"
                  />
                </ListItemButton>
                
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <ScheduleIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="กำหนดตารางรายงาน"
                    secondary="สร้างรายงานอัตโนมัติ"
                  />
                </ListItemButton>
                
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <DateRangeIcon sx={{ color: theme.palette.info.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="ข้อมูลย้อนหลัง"
                    secondary="เข้าถึงรายงานที่เก็บไว้"
                  />
                </ListItemButton>
              </List>
            </CardContent>
          </Card>

          {/* Chart Types */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ตัวเลือกการแสดงผล
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ShowChartIcon />}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  กราฟเส้น
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BarChartIcon />}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  กราฟแท่ง
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PieChartIcon />}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  กราฟวงกลม
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  ตารางข้อมูล
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;