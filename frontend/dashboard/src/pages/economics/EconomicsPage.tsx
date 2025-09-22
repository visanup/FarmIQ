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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
  Alert,
  Pagination, Fade, Zoom, TextField, InputAdornment
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Agriculture as AgricultureIcon,
  LocalGasStation as FuelIcon,
  Water as WaterIcon,
  Handyman as MaintenanceIcon,
  Group as LaborIcon,
  Grass as SeedsIcon,
  ShowChart as ChartIcon,
  GetApp as ExportIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';
import { masterServiceClient } from '../../services/api';
import { EconomicData, Farm } from '../../types/api';
import { safeRenderValue, safeRenderNumber } from '../../utils/displayUtils';

interface CostCategory {
  id: string;
  name: string;
  customerId: number; // Add customer ID for filtering
  amount: number;
  budget: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactElement;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  customerId: number; // Add customer ID for filtering
  category: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  farm: string;
}

const costCategories: CostCategory[] = [
  {
    id: '1',
    name: 'เมล็ดพันธุ์และปุ๋ย',
    customerId: 1,
    amount: 125000,
    budget: 150000,
    percentage: 83.3,
    trend: 'up',
    icon: <SeedsIcon />,
    color: '#4caf50',
  },
  {
    id: '2',
    name: 'ค่าแรงงาน',
    customerId: 1,
    amount: 89000,
    budget: 100000,
    percentage: 89,
    trend: 'stable',
    icon: <LaborIcon />,
    color: '#2196f3',
  },
  {
    id: '3',
    name: 'น้ำและระบบรดน้ำ',
    customerId: 1,
    amount: 45000,
    budget: 60000,
    percentage: 75,
    trend: 'down',
    icon: <WaterIcon />,
    color: '#00bcd4',
  },
  {
    id: '4',
    name: 'เชื้อเพลิงและพลังงาน',
    customerId: 2,
    amount: 67000,
    budget: 70000,
    percentage: 95.7,
    trend: 'up',
    icon: <FuelIcon />,
    color: '#ff9800',
  },
  {
    id: '5',
    name: 'การบำรุงรักษา',
    customerId: 2,
    amount: 23000,
    budget: 40000,
    percentage: 57.5,
    trend: 'down',
    icon: <MaintenanceIcon />,
    color: '#9c27b0',
  },
];

const transactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    customerId: 1,
    category: 'เมล็ดพันธุ์และปุ๋ย',
    description: 'ซื้อปุ๋ยอินทรีย์',
    amount: -15000,
    type: 'expense',
    farm: 'ฟาร์มเกษตรอินทรีย์',
  },
  {
    id: '2',
    date: '2024-01-14',
    customerId: 1,
    category: 'รายได้',
    description: 'ขายข้าวที่เก็บเกี่ยว',
    amount: 75000,
    type: 'income',
    farm: 'ฟาร์มเกษตรอินทรีย์',
  },
  {
    id: '3',
    date: '2024-01-13',
    customerId: 2,
    category: 'ค่าแรงงาน',
    description: 'จ่ายค่าแรงงานรายสัปดาห์',
    amount: -12000,
    type: 'expense',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
  },
  {
    id: '4',
    date: '2024-01-12',
    customerId: 1,
    category: 'เชื้อเพลิงและพลังงาน',
    description: 'ดีเซลสำหรับรถแทรกเตอร์',
    amount: -8500,
    type: 'expense',
    farm: 'โรงเรือนคอมเพล็กซ์',
  },
  {
    id: '5',
    date: '2024-01-11',
    customerId: 2,
    category: 'น้ำและระบบรดน้ำ',
    description: 'ค่าน้ำประปา',
    amount: -5200,
    type: 'expense',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
  },
];

const EconomicsPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [period, setPeriod] = useState('month');
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const itemsPerPage = 10;
  
  // Economic data from API
  const [economicData, setEconomicData] = useState<EconomicData[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [filteredCostCategories, setFilteredCostCategories] = useState<CostCategory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Load economic data
  const loadEconomicData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [economicDataResult, farmsResult] = await Promise.all([
        masterServiceClient.getEconomicData({
          customerId: state.currentCustomer?.id,
          type: 'expense'
        }),
        masterServiceClient.getFarms()
      ]);
      
      setEconomicData(economicDataResult);
      setFarms(farmsResult);
      setLastUpdate(new Date());
      
      // Process economic data into cost categories and transactions
      processEconomicData(economicDataResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load economic data.');
    } finally {
      setLoading(false);
    }
  };

  const processEconomicData = (data: EconomicData[]) => {
    // Group by category for cost categories
    const categoryMap = new Map<string, { amount: number; budget: number; count: number }>();
    
    data.forEach(item => {
      if (item.type === 'expense') {
        const existing = categoryMap.get(item.category) || { amount: 0, budget: 0, count: 0 };
        categoryMap.set(item.category, {
          amount: existing.amount + item.amount,
          budget: existing.budget + (item.budget || 0),
          count: existing.count + 1
        });
      }
    });

    const costCategories: CostCategory[] = Array.from(categoryMap.entries()).map(([category, data], index) => ({
      id: `cat-${index}`,
      name: category,
      customerId: state.currentCustomer?.id || 0,
      amount: data.amount,
      budget: data.budget,
      percentage: data.budget > 0 ? (data.amount / data.budget) * 100 : 0,
      trend: data.amount > data.budget ? 'up' : data.amount < data.budget * 0.8 ? 'down' : 'stable',
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));

    const transactions: Transaction[] = data.map(item => ({
      id: item.id,
      date: item.date,
      customerId: parseInt(item.customerId),
      category: item.category,
      description: item.description || '',
      amount: item.type === 'income' ? item.amount : -item.amount,
      type: item.type,
      farm: farms.find(f => f.id === item.farmId)?.name || 'Unknown Farm'
    }));

    setFilteredCostCategories(costCategories);
    setFilteredTransactions(transactions);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('เมล็ดพันธุ์') || category.includes('ปุ๋ย')) return <SeedsIcon />;
    if (category.includes('แรงงาน')) return <LaborIcon />;
    if (category.includes('น้ำ')) return <WaterIcon />;
    if (category.includes('เชื้อเพลิง') || category.includes('พลังงาน')) return <FuelIcon />;
    if (category.includes('บำรุงรักษา')) return <MaintenanceIcon />;
    return <AgricultureIcon />;
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('เมล็ดพันธุ์') || category.includes('ปุ๋ย')) return '#4caf50';
    if (category.includes('แรงงาน')) return '#2196f3';
    if (category.includes('น้ำ')) return '#00bcd4';
    if (category.includes('เชื้อเพลิง') || category.includes('พลังงาน')) return '#ff9800';
    if (category.includes('บำรุงรักษา')) return '#9c27b0';
    return '#607d8b';
  };

  // Load data when component mounts or customer changes
  useEffect(() => {
    if (state.currentCustomer || state.isAdmin) {
      loadEconomicData();
    }
  }, [state.currentCustomer, state.isAdmin]);

  // Filter transactions based on search term
  const searchFilteredTransactions = filteredTransactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.farm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for transactions
  const totalPages = Math.ceil(searchFilteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = searchFilteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);
  const handleRefresh = () => loadEconomicData();

  const totalExpenses = filteredCostCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalBudget = filteredCostCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.error.main }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <ChartIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', boxShadow: '0 4px 15px rgba(76,175,80,0.4)' }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>การจัดการทางการเงิน</Typography>
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>การวิเคราะห์ต้นทุน ผลกำไร และการติดตามทางการเงินของฟาร์ม</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}</Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>รีเฟรช</Button>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>ช่วงเวลา</InputLabel>
                  <Select
                    value={period}
                    label="ช่วงเวลา"
                    onChange={(e) => setPeriod(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="week">สัปดาห์</MenuItem>
                    <MenuItem value="month">เดือน</MenuItem>
                    <MenuItem value="quarter">ไตรมาส</MenuItem>
                    <MenuItem value="year">ปี</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  ส่งออกรายงาน
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Fade>

      {/* Search */}
      <Fade in timeout={600}>
        <Box sx={{ p: 3 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                variant="outlined"
                size="medium"
                placeholder="ค้นหารายการทางการเงิน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                sx={{ width: { xs: '100%', sm: 400 } }}
              />
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Financial Summary Cards */}
      <Fade in timeout={800}>
        <Box sx={{ px: 3, mb: 4 }}>
          <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  mr: 2,
                }}
              >
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(totalIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  รายได้รวม
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.error.main,
                  mr: 2,
                }}
              >
                <TrendingDownIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(totalExpenses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ค่าใช้จ่ายรวม
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: profit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  mr: 2,
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: profit >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  {formatCurrency(profit)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กำไรสุทธิ
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <AgricultureIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {((totalExpenses / totalBudget) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  การใช้งบประมาณ
                </Typography>
              </Box>
            </Box>
          </Card>
          </Grid>
        </Box>
      </Fade>

      {/* Tabs */}
      <Fade in timeout={1000}>
        <Box sx={{ px: 3, mb: 3 }}>
          <Card sx={{ borderRadius: 4 }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Tab label="📊 การวิเคราะห์ต้นทุน" />
              <Tab label="💳 รายการ" />
              <Tab label="📈 งบประมาณ vs จริง" />
            </Tabs>
          </Card>
        </Box>
      </Fade>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Fade in timeout={1200}>
          <Box sx={{ px: 3, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Cost Categories */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      หมวดหมู่ค่าใช้จ่าย
                    </Typography>
                    <Grid container spacing={2}>
                      {filteredCostCategories.map((category, index) => (
                        <Zoom in timeout={800 + (index * 100)} key={category.id}>
                          <Grid item xs={12} sm={6}>
                            <Card
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: 4,
                                borderColor: category.color,
                                borderWidth: 1,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: `${category.color}20`,
                                    color: category.color,
                                    mr: 2,
                                  }}
                                >
                                  {category.icon}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {category.name}
                                  </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(category.amount)}
                                  </Typography>
                                </Box>
                                {getTrendIcon(category.trend)}
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    การใช้งบประมาณ
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {category.percentage.toFixed(1)}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={category.percentage}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: `${category.color}20`,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: category.color,
                                    },
                                  }}
                                />
                              </Box>

                              <Typography variant="caption" color="text.secondary">
                                งบประมาณ: {formatCurrency(category.budget)}
                              </Typography>
                            </Card>
                          </Grid>
                        </Zoom>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Cost Distribution */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      การกระจายต้นทุน
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {filteredCostCategories.map((category, index) => (
                        <Zoom in timeout={1000 + (index * 100)} key={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: category.color,
                                borderRadius: 1,
                                mr: 2,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {category.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {((category.amount / totalExpenses) * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(category.amount)}
                            </Typography>
                          </Box>
                        </Zoom>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {currentTab === 1 && (
        <Fade in timeout={1200}>
          <Box sx={{ px: 3, mb: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    รายการล่าสุด
                  </Typography>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>ฟาร์ม</InputLabel>
                    <Select
                      value={selectedFarm}
                      label="ฟาร์ม"
                      onChange={(e) => setSelectedFarm(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">ทุกฟาร์ม</MenuItem>
                      {farms.map((farm) => (
                        <MenuItem key={farm.id} value={farm.id}>
                          {safeRenderValue(farm.name)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                      <TableRow>
                        <TableCell>วันที่</TableCell>
                        <TableCell>รายละเอียด</TableCell>
                        <TableCell>หมวดหมู่</TableCell>
                        <TableCell>ฟาร์ม</TableCell>
                        <TableCell align="right">จำนวนเงิน</TableCell>
                        <TableCell>การดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentTransactions.map((transaction, index) => (
                        <Zoom in timeout={600 + (index * 100)} key={transaction.id}>
                          <TableRow hover>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(transaction.date).toLocaleDateString('th-TH')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {transaction.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.category}
                                size="small"
                                color={transaction.type === 'income' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {transaction.farm}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: transaction.amount > 0 ? theme.palette.success.main : theme.palette.error.main,
                                }}
                              >
                                {formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Card sx={{ p: 2, borderRadius: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">แสดง {startIndex + 1}-{Math.min(endIndex, searchFilteredTransactions.length)} จาก {searchFilteredTransactions.length} รายการ</Typography>
                        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
                      </Box>
                    </Card>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      {currentTab === 2 && (
        <Fade in timeout={1200}>
          <Box sx={{ px: 3, mb: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  การเปรียบเทียบงบประมาณกับค่าใช้จริง
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                      <TableRow>
                        <TableCell>หมวดหมู่</TableCell>
                        <TableCell align="right">งบประมาณ</TableCell>
                        <TableCell align="right">ค่าใช้จริง</TableCell>
                        <TableCell align="right">ความแตกต่าง</TableCell>
                        <TableCell>ความคืบหน้า</TableCell>
                        <TableCell>สถานะ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCostCategories.map((category, index) => {
                        const variance = category.amount - category.budget;
                        const variancePercentage = (variance / category.budget) * 100;
                        
                        return (
                          <Zoom in timeout={600 + (index * 100)} key={category.id}>
                            <TableRow hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: `${category.color}20`,
                                      color: category.color,
                                      mr: 2,
                                      width: 32,
                                      height: 32,
                                    }}
                                  >
                                    {category.icon}
                                  </Avatar>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {category.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatCurrency(category.budget)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(category.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: variance > 0 ? theme.palette.error.main : theme.palette.success.main,
                                  }}
                                >
                                  {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(category.percentage, 100)}
                                    sx={{
                                      width: 100,
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: `${category.color}20`,
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: category.percentage > 100 ? theme.palette.error.main : category.color,
                                      },
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {category.percentage.toFixed(0)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    category.percentage > 100 ? 'เกินงบประมาณ' :
                                    category.percentage > 80 ? 'ตามแผน' : 'ต่ำกว่างบประมาณ'
                                  }
                                  size="small"
                                  color={
                                    category.percentage > 100 ? 'error' :
                                    category.percentage > 80 ? 'warning' : 'success'
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          </Zoom>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default EconomicsPage;