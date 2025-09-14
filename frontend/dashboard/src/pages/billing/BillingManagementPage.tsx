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
} from '@mui/icons-material';
import { customerService, type Subscription, type PlanCatalog } from '@/services/customer/customerService';

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

const BillingManagementPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<PlanCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newPlanCode, setNewPlanCode] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subsData, plansData] = await Promise.all([
        customerService.getSubscriptions(),
        customerService.getPlans()
      ]);
      setSubscriptions(subsData);
      setPlans(plansData);
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedSubscription || !newPlanCode) return;
    try {
      const updated = await customerService.changePlan(selectedSubscription.subscription_id, newPlanCode);
      setSubscriptions(subscriptions.map(s => 
        s.subscription_id === updated.subscription_id ? updated : s
      ));
      setChangePlanDialogOpen(false);
      setSelectedSubscription(null);
      setNewPlanCode('');
    } catch (err) {
      setError('Failed to change plan');
    }
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Billing Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage subscriptions, plans, and billing information
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ${totalMonthlyRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SubscriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {activeSubscriptionsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Subscriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    +15%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Growth This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {mockBillingHistory.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Invoices
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active Subscriptions" />
          <Tab label="Available Plans" />
          <Tab label="Billing History" />
          <Tab label="Payment Methods" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {/* Active Subscriptions */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Active Subscriptions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Next Billing</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.subscription_id}>
                    <TableCell>Customer #{subscription.customer_id}</TableCell>
                    <TableCell>
                      <Chip label={subscription.plan_code} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(subscription.status)}
                        label={subscription.status}
                        color={getStatusColor(subscription.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Ongoing'}
                    </TableCell>
                    <TableCell>${subscription.meta?.monthly_fee || 0}/month</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setChangePlanDialogOpen(true);
                        }}
                      >
                        Change Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Available Plans */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Available Plans
          </Typography>
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.plan_code}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Features:
                    </Typography>
                    <List dense>
                      {plan.entitlements && Object.entries(plan.entitlements).map(([key, value]) => (
                        <ListItem key={key} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${key.replace('_', ' ')}: ${value}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!plan.is_active}
                    >
                      {plan.is_active ? 'Available' : 'Not Available'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {/* Billing History */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Billing History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockBillingHistory.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DateIcon sx={{ mr: 1, fontSize: 18 }} />
                        {new Date(invoice.date).toLocaleDateString()}
                      </Box>
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>
                      <Chip label={invoice.plan} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(invoice.status)}
                        label={invoice.status}
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {/* Payment Methods */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Methods
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCardIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h6">Credit Card</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    **** **** **** 4242
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expires: 12/25
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Update Card
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ border: '2px dashed', borderColor: 'divider' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PaymentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Add Payment Method
                  </Typography>
                  <Button variant="outlined">
                    Add Card
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onClose={() => setChangePlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Subscription Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Current Plan: <strong>{selectedSubscription?.plan_code}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>New Plan</InputLabel>
              <Select
                value={newPlanCode}
                label="New Plan"
                onChange={(e) => setNewPlanCode(e.target.value)}
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
        <DialogActions>
          <Button onClick={() => setChangePlanDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePlan} disabled={!newPlanCode}>
            Change Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingManagementPage;