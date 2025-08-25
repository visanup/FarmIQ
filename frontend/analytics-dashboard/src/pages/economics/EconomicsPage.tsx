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
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

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
  
  // Customer filtering for cost categories and transactions
  const [allCostCategories] = useState<CostCategory[]>(costCategories);
  const [allTransactions] = useState<Transaction[]>(transactions);
  const [filteredCostCategories, setFilteredCostCategories] = useState<CostCategory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter data based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all financial data
      setFilteredCostCategories(allCostCategories);
      setFilteredTransactions(allTransactions);
    } else if (state.currentCustomer) {
      // Regular customer sees only their financial data
      const customerCostCategories = allCostCategories.filter(category => category.customerId === state.currentCustomer?.id);
      const customerTransactions = allTransactions.filter(transaction => transaction.customerId === state.currentCustomer?.id);
      setFilteredCostCategories(customerCostCategories);
      setFilteredTransactions(customerTransactions);
    } else {
      // No access
      setFilteredCostCategories([]);
      setFilteredTransactions([]);
    }
  }, [state.currentCustomer, state.isAdmin, allCostCategories, allTransactions]);

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
    <Box sx={{ p: 3 }}>
      <CustomerAwarePageHeader
        title="💰 การจัดการทางการเงิน"
        subtitle="การวิเคราะห์ต้นทุน ผลกำไร และการติดตามทางการเงินของฟาร์ม"
        actionButton={
          <Box sx={{ display: 'flex', gap: 2 }}>
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
              variant="outlined"
              startIcon={<ExportIcon />}
              sx={{ borderRadius: 2 }}
            >
              ส่งออกรายงาน
            </Button>
          </Box>
        }
        noDataMessage={filteredCostCategories.length === 0 && filteredTransactions.length === 0 ? "ไม่พบข้อมูลทางการเงินสำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
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

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Cost Categories */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  หมวดหมู่ค่าใช้จ่าย
                </Typography>
                <Grid container spacing={2}>
                  {filteredCostCategories.map((category) => (
                    <Grid item xs={12} sm={6} key={category.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
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
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  การกระจายต้นทุน
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredCostCategories.map((category) => (
                    <Box key={category.id} sx={{ display: 'flex', alignItems: 'center' }}>
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
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Card>
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
                  <MenuItem value="north">ฟาร์มเกษตรอินทรีย์</MenuItem>
                  <MenuItem value="organic">ฟาร์มไฮโดรโปนิกส์</MenuItem>
                  <MenuItem value="greenhouse">โรงเรือนคอมเพล็กซ์</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
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
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              การเปรียบเทียบงบประมาณกับค่าใช้จริง
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
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
                  {filteredCostCategories.map((category) => {
                    const variance = category.amount - category.budget;
                    const variancePercentage = (variance / category.budget) * 100;
                    
                    return (
                      <TableRow key={category.id} hover>
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
                              category.percentage > 100 ? 'Over Budget' :
                              category.percentage > 80 ? 'On Track' : 'Under Budget'
                            }
                            size="small"
                            color={
                              category.percentage > 100 ? 'error' :
                              category.percentage > 80 ? 'warning' : 'success'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EconomicsPage;