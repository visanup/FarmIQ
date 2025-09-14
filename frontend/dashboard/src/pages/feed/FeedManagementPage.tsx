import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Agriculture as FeedIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as DeliveryIcon,
  Schedule as ScheduleIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

interface FeedBatch {
  id: string;
  feedType: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  supplier: string;
  productionDate: string;
  expiryDate: string;
  status: 'fresh' | 'expiring' | 'expired';
  location: string;
  cost: number;
  customerId: number; // Add customer ID for filtering
  nutritionInfo: {
    protein: number;
    fat: number;
    fiber: number;
    moisture: number;
  };
}

interface FeedInventory {
  id: string;
  feedType: string;
  totalStock: number;
  unit: string;
  reorderLevel: number;
  avgConsumption: number;
  daysRemaining: number;
  status: 'sufficient' | 'low' | 'critical';
  customerId: number; // Add customer ID for filtering
}

const mockFeedBatches: FeedBatch[] = [
  {
    id: '1',
    feedType: 'Starter Feed',
    batchNumber: 'SF-2024-001',
    quantity: 500,
    unit: 'kg',
    supplier: 'Premium Feed Co.',
    productionDate: '2024-01-10',
    expiryDate: '2024-07-10',
    status: 'fresh',
    location: 'Warehouse A',
    cost: 25000,
    customerId: 1,
    nutritionInfo: { protein: 22, fat: 4, fiber: 3.5, moisture: 12 },
  },
  {
    id: '2',
    feedType: 'Grower Feed',
    batchNumber: 'GF-2024-002',
    quantity: 750,
    unit: 'kg',
    supplier: 'AgriNutrition Ltd.',
    productionDate: '2024-01-05',
    expiryDate: '2024-06-05',
    status: 'expiring',
    location: 'Warehouse B',
    cost: 35000,
    customerId: 1,
    nutritionInfo: { protein: 18, fat: 3.5, fiber: 4, moisture: 12 },
  },
  {
    id: '3',
    feedType: 'Layer Feed',
    batchNumber: 'LF-2024-003',
    quantity: 300,
    unit: 'kg',
    supplier: 'Poultry Nutrition Co.',
    productionDate: '2023-12-20',
    expiryDate: '2024-03-20',
    status: 'expired',
    location: 'Warehouse A',
    cost: 18000,
    customerId: 2,
    nutritionInfo: { protein: 16, fat: 2.5, fiber: 5, moisture: 11 },
  },
  {
    id: '4',
    feedType: 'Finisher Feed',
    batchNumber: 'FF-2024-004',
    quantity: 600,
    unit: 'kg',
    supplier: 'Premium Feed Co.',
    productionDate: '2024-01-15',
    expiryDate: '2024-08-15',
    status: 'fresh',
    location: 'Warehouse C',
    cost: 30000,
    customerId: 1,
    nutritionInfo: { protein: 20, fat: 3, fiber: 4.5, moisture: 11.5 },
  },
];

const mockInventory: FeedInventory[] = [
  {
    id: '1',
    feedType: 'Starter Feed',
    totalStock: 1200,
    unit: 'kg',
    reorderLevel: 500,
    avgConsumption: 50,
    daysRemaining: 24,
    status: 'sufficient',
    customerId: 1,
  },
  {
    id: '2',
    feedType: 'Grower Feed',
    totalStock: 300,
    unit: 'kg',
    reorderLevel: 400,
    avgConsumption: 75,
    daysRemaining: 4,
    status: 'critical',
    customerId: 1,
  },
  {
    id: '3',
    feedType: 'Layer Feed',
    totalStock: 800,
    unit: 'kg',
    reorderLevel: 600,
    avgConsumption: 60,
    daysRemaining: 13,
    status: 'low',
    customerId: 2,
  },
  {
    id: '4',
    feedType: 'Finisher Feed',
    totalStock: 900,
    unit: 'kg',
    reorderLevel: 400,
    avgConsumption: 40,
    daysRemaining: 22,
    status: 'sufficient',
    customerId: 1,
  },
];

const FeedManagementPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<FeedBatch | null>(null);
  
  // Filter data based on current customer
  const [allBatches] = useState<FeedBatch[]>(mockFeedBatches);
  const [allInventory] = useState<FeedInventory[]>(mockInventory);
  const [feedBatches, setFeedBatches] = useState<FeedBatch[]>([]);
  const [inventory, setInventory] = useState<FeedInventory[]>([]);

  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all data
      setFeedBatches(allBatches);
      setInventory(allInventory);
    } else if (state.currentCustomer) {
      // Regular customer sees only their data
      const customerBatches = allBatches.filter(batch => batch.customerId === state.currentCustomer?.id);
      const customerInventory = allInventory.filter(inv => inv.customerId === state.currentCustomer?.id);
      setFeedBatches(customerBatches);
      setInventory(customerInventory);
    } else {
      setFeedBatches([]);
      setInventory([]);
    }
  }, [state.currentCustomer, state.isAdmin, allBatches, allInventory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
      case 'sufficient':
        return theme.palette.success.main;
      case 'expiring':
      case 'low':
        return theme.palette.warning.main;
      case 'expired':
      case 'critical':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh':
      case 'sufficient':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'expiring':
      case 'low':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'expired':
      case 'critical':
        return <WarningIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <CheckCircleIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const criticalStock = mockInventory.filter(item => item.status === 'critical');
  const lowStock = mockInventory.filter(item => item.status === 'low');
  const expiringBatches = mockFeedBatches.filter(batch => batch.status === 'expiring');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Feed Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage feed inventory, track batches, and monitor nutrition quality
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Add New Batch
        </Button>
      </Box>

      {/* Alerts */}
      {(criticalStock.length > 0 || lowStock.length > 0 || expiringBatches.length > 0) && (
        <Box sx={{ mb: 4 }}>
          {criticalStock.length > 0 && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Critical Stock Alert
              </Typography>
              {criticalStock.length} feed type(s) are critically low and need immediate restocking.
            </Alert>
          )}
          {expiringBatches.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Expiring Batches
              </Typography>
              {expiringBatches.length} batch(es) are approaching expiry date.
            </Alert>
          )}
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <FeedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {mockFeedBatches.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Batches
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
                  bgcolor: theme.palette.secondary.main,
                  mr: 2,
                }}
              >
                <InventoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {mockInventory.reduce((sum, item) => sum + item.totalStock, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Stock (kg)
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
                  bgcolor: theme.palette.warning.main,
                  mr: 2,
                }}
              >
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {criticalStock.length + lowStock.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Stock Items
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
                  bgcolor: theme.palette.info.main,
                  mr: 2,
                }}
              >
                <ReportIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatCurrency(mockFeedBatches.reduce((sum, batch) => sum + batch.cost, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Value
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
          <Tab label="Feed Batches" />
          <Tab label="Inventory Status" />
          <Tab label="Nutrition Analysis" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Feed Batches
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch Info</TableCell>
                    <TableCell>Feed Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockFeedBatches.map((batch) => (
                    <TableRow key={batch.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {batch.batchNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {batch.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.light,
                              mr: 1,
                              width: 32,
                              height: 32,
                            }}
                          >
                            🌾
                          </Avatar>
                          <Typography variant="body2">{batch.feedType}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {batch.quantity} {batch.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{batch.supplier}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Prod: {new Date(batch.productionDate).toLocaleDateString('th-TH')}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Exp: {new Date(batch.expiryDate).toLocaleDateString('th-TH')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(batch.status)}
                          <Chip
                            label={batch.status.toUpperCase()}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: `${getStatusColor(batch.status)}20`,
                              color: getStatusColor(batch.status),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{batch.location}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(batch.cost)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
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

      {currentTab === 1 && (
        <Grid container spacing={3}>
          {mockInventory.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${getStatusColor(item.status)}20`,
                        color: getStatusColor(item.status),
                        mr: 2,
                      }}
                    >
                      <InventoryIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.feedType}
                      </Typography>
                      <Chip
                        label={item.status.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(item.status)}20`,
                          color: getStatusColor(item.status),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.totalStock} {item.unit}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Stock Level
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {((item.totalStock / (item.reorderLevel * 2)) * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.totalStock / (item.reorderLevel * 2)) * 100, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${getStatusColor(item.status)}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(item.status),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Days Remaining
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.daysRemaining} days
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reorder Level
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.reorderLevel} {item.unit}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Daily Consumption
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.avgConsumption} {item.unit}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Nutrition Analysis
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Feed Type</TableCell>
                    <TableCell>Protein (%)</TableCell>
                    <TableCell>Fat (%)</TableCell>
                    <TableCell>Fiber (%)</TableCell>
                    <TableCell>Moisture (%)</TableCell>
                    <TableCell>Quality Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockFeedBatches.map((batch) => {
                    const qualityScore = (
                      (batch.nutritionInfo.protein * 0.4) +
                      (batch.nutritionInfo.fat * 0.2) +
                      (batch.nutritionInfo.fiber * 0.2) +
                      ((20 - batch.nutritionInfo.moisture) * 0.2)
                    ).toFixed(1);

                    return (
                      <TableRow key={batch.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {batch.feedType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {batch.batchNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{batch.nutritionInfo.protein}%</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{batch.nutritionInfo.fat}%</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{batch.nutritionInfo.fiber}%</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{batch.nutritionInfo.moisture}%</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${qualityScore}/10`}
                            size="small"
                            color={parseFloat(qualityScore) > 7 ? 'success' : parseFloat(qualityScore) > 5 ? 'warning' : 'error'}
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

      {/* Add Batch Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Feed Batch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Feed Type</InputLabel>
                <Select label="Feed Type" sx={{ borderRadius: 2 }}>
                  <MenuItem value="starter">Starter Feed</MenuItem>
                  <MenuItem value="grower">Grower Feed</MenuItem>
                  <MenuItem value="layer">Layer Feed</MenuItem>
                  <MenuItem value="finisher">Finisher Feed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity (kg)"
                type="number"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Production Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Add Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedManagementPage;