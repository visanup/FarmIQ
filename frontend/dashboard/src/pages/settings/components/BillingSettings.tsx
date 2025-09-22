import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Subscriptions as SubscriptionIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  DateRange as DateIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Mock billing data - in real app this would come from billing service
const mockBillingHistory = [
  {
    id: '2024-001',
    date: '2024-01-15',
    amount: 299.00,
    status: 'paid',
    plan: 'PRO',
    description: 'Monthly subscription - January 2024'
  },
  {
    id: '2023-012',
    date: '2023-12-15',
    amount: 299.00,
    status: 'paid',
    plan: 'PRO',
    description: 'Monthly subscription - December 2023'
  },
  {
    id: '2023-011',
    date: '2023-11-15',
    amount: 199.00,
    status: 'paid',
    plan: 'TEAM',
    description: 'Monthly subscription - November 2023'
  }
];

const mockSubscriptions = [
  {
    subscription_id: 'sub_001',
    customer_id: 1,
    plan_code: 'PRO',
    status: 'active',
    start_date: '2024-01-01',
    end_date: null,
    meta: { monthly_fee: 299 }
  },
  {
    subscription_id: 'sub_002',
    customer_id: 2,
    plan_code: 'TEAM',
    status: 'active',
    start_date: '2024-01-15',
    end_date: null,
    meta: { monthly_fee: 199 }
  }
];

const mockPlans = [
  {
    plan_code: 'BASIC',
    name: 'Basic Plan',
    description: 'Perfect for small farms',
    is_active: true,
    entitlements: {
      max_devices: 10,
      max_users: 2,
      data_retention_days: 30,
      support_level: 'email'
    }
  },
  {
    plan_code: 'TEAM',
    name: 'Team Plan',
    description: 'Ideal for growing operations',
    is_active: true,
    entitlements: {
      max_devices: 50,
      max_users: 10,
      data_retention_days: 90,
      support_level: 'priority'
    }
  },
  {
    plan_code: 'PRO',
    name: 'Professional Plan',
    description: 'For large-scale operations',
    is_active: true,
    entitlements: {
      max_devices: 200,
      max_users: 50,
      data_retention_days: 365,
      support_level: 'dedicated'
    }
  }
];

const BillingSettings: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [plans, setPlans] = useState(mockPlans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [newPlanCode, setNewPlanCode] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // In real app, this would refresh data from API
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'paid': return 'success';
      case 'paused': case 'pending': return 'warning';
      case 'canceled': case 'failed': return 'error';
      case 'expired': case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'paid': return <CheckIcon />;
      case 'paused': case 'pending': return <WarningIcon />;
      case 'canceled': case 'failed': case 'expired': case 'overdue': return <ErrorIcon />;
      default: return null;
    }
  };

  const totalMonthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.meta?.monthly_fee || 0), 0);

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <Box>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                width: 48, 
                height: 48, 
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}>
                <PaymentIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  การจัดการบิล
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  จัดการการสมัครสมาชิก แผนการใช้งาน และข้อมูลการเรียกเก็บเงิน
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                รีเฟรช
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in timeout={600}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)'
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Overview Cards */}
      <Fade in timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      ฿{totalMonthlyRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      รายได้รายเดือน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }}>
                    <SubscriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {activeSubscriptionsCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      การสมัครสมาชิกที่ใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                  }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      +15%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      การเติบโตเดือนนี้
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.15)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'secondary.main', 
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                  }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {mockBillingHistory.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ใบแจ้งหนี้ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Tabs */}
      <Fade in timeout={1000}>
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px 12px 0 0'
          }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 2,
                  px: 3,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                }
              }}
            >
              <Tab label="📋 การสมัครสมาชิกที่ใช้งาน" />
              <Tab label="📦 แผนการใช้งาน" />
              <Tab label="🧾 ประวัติการเรียกเก็บเงิน" />
              <Tab label="💳 วิธีการชำระเงิน" />
            </Tabs>
          </Box>

          {/* Active Subscriptions Tab */}
          <TabPanel value={currentTab} index={0}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
              การสมัครสมาชิกที่ใช้งาน
            </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      color: 'text.primary',
                      borderBottom: '2px solid',
                      borderBottomColor: 'primary.main'
                    }
                  }}>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell>แผน</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>วันที่เริ่มต้น</TableCell>
                    <TableCell>การเรียกเก็บเงินครั้งต่อไป</TableCell>
                    <TableCell>จำนวนเงิน</TableCell>
                    <TableCell>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription, index) => (
                    <Zoom in timeout={600 + index * 100} key={subscription.subscription_id}>
                      <TableRow 
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ลูกค้า #{subscription.customer_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={subscription.plan_code} 
                            color="primary" 
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(subscription.status)}
                            label={subscription.status}
                            color={getStatusColor(subscription.status) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {new Date(subscription.start_date).toLocaleDateString('th-TH')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('th-TH') : 'ต่อเนื่อง'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ฿{subscription.meta?.monthly_fee || 0}/เดือน
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setChangePlanDialogOpen(true);
                              }}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              เปลี่ยนแผน
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Zoom>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Available Plans Tab */}
          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
              แผนการใช้งานที่มี
            </Typography>
            <Grid container spacing={3}>
              {plans.map((plan, index) => (
                <Grid item xs={12} md={4} key={plan.plan_code}>
                  <Zoom in timeout={600 + index * 200}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main', 
                            mr: 2,
                            width: 40,
                            height: 40
                          }}>
                            <SubscriptionIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {plan.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {plan.description}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
                          ฟีเจอร์:
                        </Typography>
                        <List dense>
                          {plan.entitlements && Object.entries(plan.entitlements).map(([key, value]) => (
                            <ListItem key={key} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={`${key.replace('_', ' ')}: ${value}`}
                                primaryTypographyProps={{ 
                                  variant: 'body2',
                                  fontWeight: 500
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Button
                          variant={plan.is_active ? "contained" : "outlined"}
                          fullWidth
                          sx={{ 
                            mt: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.5
                          }}
                          disabled={!plan.is_active}
                        >
                          {plan.is_active ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Billing History Tab */}
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
              ประวัติการเรียกเก็บเงิน
            </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      color: 'text.primary',
                      borderBottom: '2px solid',
                      borderBottomColor: 'primary.main'
                    }
                  }}>
                    <TableCell>หมายเลขใบแจ้งหนี้</TableCell>
                    <TableCell>วันที่</TableCell>
                    <TableCell>รายละเอียด</TableCell>
                    <TableCell>แผน</TableCell>
                    <TableCell>จำนวนเงิน</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockBillingHistory.map((invoice, index) => (
                    <Zoom in timeout={600 + index * 100} key={invoice.id}>
                      <TableRow 
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {invoice.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DateIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {new Date(invoice.date).toLocaleDateString('th-TH')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={invoice.plan} 
                            color="primary" 
                            variant="outlined" 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            ฿{invoice.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(invoice.status)}
                            label={invoice.status}
                            color={getStatusColor(invoice.status) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ดาวน์โหลด">
                              <IconButton size="small" color="success">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Zoom>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel value={currentTab} index={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
              วิธีการชำระเงิน
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Zoom in timeout={600}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: 'primary.main', 
                          mr: 2,
                          width: 40,
                          height: 40
                        }}>
                          <CreditCardIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          บัตรเครดิต
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        **** **** **** 4242
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                        หมดอายุ: 12/25
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        อัปเดตบัตร
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Zoom in timeout={800}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(25, 118, 210, 0.02)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(0,0,0,0.04)', 
                        mx: 'auto', 
                        mb: 2,
                        width: 64,
                        height: 64
                      }}>
                        <PaymentIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                        เพิ่มวิธีการชำระเงิน
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        เพิ่มบัตร
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Fade>

      {/* Change Plan Dialog */}
      <Dialog 
        open={changePlanDialogOpen} 
        onClose={() => setChangePlanDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          เปลี่ยนแผนการสมัครสมาชิก
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
              แผนปัจจุบัน: <strong>{selectedSubscription?.plan_code}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>แผนใหม่</InputLabel>
              <Select
                value={newPlanCode}
                label="แผนใหม่"
                onChange={(e) => setNewPlanCode(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {plans.filter(p => p.is_active && p.plan_code !== selectedSubscription?.plan_code).map((plan) => (
                  <MenuItem key={plan.plan_code} value={plan.plan_code}>
                    {plan.name} ({plan.plan_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setChangePlanDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Handle plan change
              setChangePlanDialogOpen(false);
            }} 
            disabled={!newPlanCode}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            เปลี่ยนแผน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingSettings;
