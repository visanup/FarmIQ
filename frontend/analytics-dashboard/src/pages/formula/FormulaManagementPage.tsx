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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
} from '@mui/material';
import {
  Science as FormulaIcon,
  Biotech as NutritionIcon,
  Calculate as CalculateIcon,
  TrendingUp as OptimizeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  SaveAlt as SaveIcon,
  PlayArrow as SimulateIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

interface NutrientRequirement {
  nutrient: string;
  min: number;
  max: number;
  target: number;
  unit: string;
}

interface Ingredient {
  id: string;
  name: string;
  customerId: number; // Add customer ID for filtering
  cost: number;
  unit: string;
  nutrients: {
    protein: number;
    fat: number;
    fiber: number;
    energy: number;
    calcium: number;
    phosphorus: number;
  };
  availability: number;
  maxInclusion: number;
}

interface Formula {
  id: string;
  name: string;
  customerId: number; // Add customer ID for filtering
  animalType: string;
  stage: string;
  status: 'draft' | 'testing' | 'approved' | 'discontinued';
  version: string;
  createdDate: string;
  lastModified: string;
  ingredients: {
    ingredientId: string;
    name: string;
    percentage: number;
    cost: number;
  }[];
  nutritionProfile: {
    protein: number;
    fat: number;
    fiber: number;
    energy: number;
    calcium: number;
    phosphorus: number;
  };
  costPerKg: number;
  efficiency: number;
}

const mockRequirements: NutrientRequirement[] = [
  { nutrient: 'Protein', min: 20, max: 25, target: 22, unit: '%' },
  { nutrient: 'Fat', min: 3, max: 6, target: 4, unit: '%' },
  { nutrient: 'Fiber', min: 2, max: 5, target: 3.5, unit: '%' },
  { nutrient: 'Energy', min: 2800, max: 3200, target: 3000, unit: 'kcal/kg' },
  { nutrient: 'Calcium', min: 0.8, max: 1.2, target: 1.0, unit: '%' },
  { nutrient: 'Phosphorus', min: 0.6, max: 0.9, target: 0.7, unit: '%' },
];

const mockIngredients: Ingredient[] = [
  {
    id: '1',
    name: 'Corn',
    customerId: 1,
    cost: 12.5,
    unit: 'THB/kg',
    nutrients: { protein: 8.5, fat: 4.0, fiber: 2.2, energy: 3350, calcium: 0.03, phosphorus: 0.25 },
    availability: 95,
    maxInclusion: 60,
  },
  {
    id: '2',
    name: 'Soybean Meal',
    customerId: 1,
    cost: 18.0,
    unit: 'THB/kg',
    nutrients: { protein: 44.0, fat: 1.5, fiber: 7.0, energy: 2230, calcium: 0.27, phosphorus: 0.65 },
    availability: 90,
    maxInclusion: 30,
  },
  {
    id: '3',
    name: 'Fish Meal',
    customerId: 2,
    cost: 45.0,
    unit: 'THB/kg',
    nutrients: { protein: 65.0, fat: 10.0, fiber: 1.0, energy: 2950, calcium: 5.5, phosphorus: 3.2 },
    availability: 75,
    maxInclusion: 15,
  },
  {
    id: '4',
    name: 'Wheat Bran',
    customerId: 1,
    cost: 8.5,
    unit: 'THB/kg',
    nutrients: { protein: 15.5, fat: 4.0, fiber: 11.0, energy: 1650, calcium: 0.13, phosphorus: 1.0 },
    availability: 88,
    maxInclusion: 20,
  },
  {
    id: '5',
    name: 'Rice Bran',
    customerId: 2,
    cost: 10.5,
    unit: 'THB/kg',
    nutrients: { protein: 12.0, fat: 15.0, fiber: 12.0, energy: 2800, calcium: 0.07, phosphorus: 1.5 },
    availability: 92,
    maxInclusion: 25,
  },
];

const mockFormulas: Formula[] = [
  {
    id: '1',
    name: 'Starter Pro Formula',
    customerId: 1,
    animalType: 'Poultry',
    stage: 'Starter',
    status: 'approved',
    version: 'v2.1',
    createdDate: '2024-01-10',
    lastModified: '2024-01-15',
    ingredients: [
      { ingredientId: '1', name: 'Corn', percentage: 55, cost: 12.5 },
      { ingredientId: '2', name: 'Soybean Meal', percentage: 25, cost: 18.0 },
      { ingredientId: '3', name: 'Fish Meal', percentage: 10, cost: 45.0 },
      { ingredientId: '4', name: 'Wheat Bran', percentage: 10, cost: 8.5 },
    ],
    nutritionProfile: { protein: 22.1, fat: 4.2, fiber: 3.4, energy: 3050, calcium: 1.0, phosphorus: 0.72 },
    costPerKg: 16.85,
    efficiency: 92,
  },
  {
    id: '2',
    name: 'Grower Max Formula',
    customerId: 1,
    animalType: 'Poultry',
    stage: 'Grower',
    status: 'testing',
    version: 'v1.3',
    createdDate: '2024-01-08',
    lastModified: '2024-01-12',
    ingredients: [
      { ingredientId: '1', name: 'Corn', percentage: 60, cost: 12.5 },
      { ingredientId: '2', name: 'Soybean Meal', percentage: 20, cost: 18.0 },
      { ingredientId: '3', name: 'Fish Meal', percentage: 8, cost: 45.0 },
      { ingredientId: '4', name: 'Wheat Bran', percentage: 12, cost: 8.5 },
    ],
    nutritionProfile: { protein: 18.8, fat: 3.9, fiber: 3.8, energy: 3100, calcium: 0.8, phosphorus: 0.65 },
    costPerKg: 15.32,
    efficiency: 88,
  },
  {
    id: '3',
    name: 'Aqua Pro Formula',
    customerId: 2,
    animalType: 'Fish',
    stage: 'Grower',
    status: 'approved',
    version: 'v1.0',
    createdDate: '2024-01-05',
    lastModified: '2024-01-10',
    ingredients: [
      { ingredientId: '3', name: 'Fish Meal', percentage: 45, cost: 45.0 },
      { ingredientId: '5', name: 'Rice Bran', percentage: 25, cost: 10.5 },
      { ingredientId: '2', name: 'Soybean Meal', percentage: 20, cost: 18.0 },
      { ingredientId: '4', name: 'Wheat Bran', percentage: 10, cost: 8.5 },
    ],
    nutritionProfile: { protein: 35.2, fat: 8.5, fiber: 6.2, energy: 2850, calcium: 2.8, phosphorus: 2.1 },
    costPerKg: 28.50,
    efficiency: 94,
  },
];

const FormulaManagementPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  
  // Customer filtering for formulas and ingredients
  const [allFormulas] = useState<Formula[]>(mockFormulas);
  const [allIngredients] = useState<Ingredient[]>(mockIngredients);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  
  // Filter data based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all formulas and ingredients
      setFormulas(allFormulas);
      setIngredients(allIngredients);
    } else if (state.currentCustomer) {
      // Regular customer sees only their data
      const customerFormulas = allFormulas.filter(formula => formula.customerId === state.currentCustomer?.id);
      const customerIngredients = allIngredients.filter(ingredient => ingredient.customerId === state.currentCustomer?.id);
      setFormulas(customerFormulas);
      setIngredients(customerIngredients);
    } else {
      // No access
      setFormulas([]);
      setIngredients([]);
    }
  }, [state.currentCustomer, state.isAdmin, allFormulas, allIngredients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.palette.success.main;
      case 'testing':
        return theme.palette.warning.main;
      case 'draft':
        return theme.palette.info.main;
      case 'discontinued':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon sx={{ color: theme.palette.success.main }} />;
      case 'testing':
      case 'draft':
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case 'discontinued':
        return <PendingIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <PendingIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    // Simulate optimization process
    setTimeout(() => {
      setOptimizing(false);
    }, 3000);
  };

  const approvedFormulas = formulas.filter(f => f.status === 'approved');
  const testingFormulas = formulas.filter(f => f.status === 'testing');

  return (
    <Box sx={{ p: 3 }}>
      <CustomerAwarePageHeader
        title="🧪 การจัดการสูตรอาหาร"
        subtitle="สร้าง เพิ่มประสิทธิภาพ และจัดการสูตรโภชนาการสำหรับการเลี้ยงสัตว์"
        actionButton={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<OptimizeIcon />}
              onClick={handleOptimize}
              disabled={optimizing}
              sx={{ borderRadius: 2 }}
            >
              {optimizing ? 'กำลังเพิ่มประสิทธิภาพ...' : 'เพิ่มประสิทธิภาพอัตโนมัติ'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              สูตรใหม่
            </Button>
          </Box>
        }
        noDataMessage={formulas.length === 0 ? "ไม่พบสูตรอาหารสำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
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
                <FormulaIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formulas.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สูตรทั้งหมด
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
                  bgcolor: theme.palette.success.main,
                  mr: 2,
                }}
              >
                <ApprovedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {approvedFormulas.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  อนุมัติแล้ว
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
                <PendingIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {testingFormulas.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  อยู่ระหว่างทดสอบ
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
                <CalculateIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {ingredients.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  วัตถุดิบ
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
          <Tab label="Formulas" />
          <Tab label="Ingredients" />
          <Tab label="Requirements" />
          <Tab label="Optimization" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Formula Library
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Formula Info</TableCell>
                    <TableCell>Animal Type</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell>Nutrition Profile</TableCell>
                    <TableCell>Cost/kg</TableCell>
                    <TableCell>Efficiency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formulas.map((formula) => (
                    <TableRow key={formula.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {formula.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formula.version} • Modified {new Date(formula.lastModified).toLocaleDateString('th-TH')}
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
                            🐔
                          </Avatar>
                          <Typography variant="body2">{formula.animalType}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={formula.stage} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Protein: {formula.nutritionProfile.protein}% • Fat: {formula.nutritionProfile.fat}%
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Energy: {formula.nutritionProfile.energy} kcal/kg
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(formula.costPerKg)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={formula.efficiency}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formula.efficiency}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(formula.status)}
                          <Chip
                            label={formula.status.toUpperCase()}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: `${getStatusColor(formula.status)}20`,
                              color: getStatusColor(formula.status),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <SimulateIcon fontSize="small" />
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
          {ingredients.map((ingredient) => (
            <Grid item xs={12} sm={6} md={4} key={ingredient.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.light,
                        mr: 2,
                      }}
                    >
                      🌾
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ingredient.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {formatCurrency(ingredient.cost)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Availability: {ingredient.availability}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={ingredient.availability}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: ingredient.availability > 80 ? theme.palette.success.main : theme.palette.warning.main,
                        },
                      }}
                    />
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Nutrition Profile
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.875rem' }}>
                    <Typography variant="caption">Protein: {ingredient.nutrients.protein}%</Typography>
                    <Typography variant="caption">Fat: {ingredient.nutrients.fat}%</Typography>
                    <Typography variant="caption">Fiber: {ingredient.nutrients.fiber}%</Typography>
                    <Typography variant="caption">Energy: {ingredient.nutrients.energy}</Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Max inclusion: {ingredient.maxInclusion}%
                  </Typography>
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
              Nutritional Requirements
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nutrient</TableCell>
                    <TableCell>Minimum</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Maximum</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRequirements.map((req, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {req.nutrient}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.min}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {req.target}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.max}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.unit}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={((req.target - req.min) / (req.max - req.min)) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Formula Optimization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Use advanced algorithms to optimize formulas for cost efficiency and nutritional targets.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Optimization Goals
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label="Minimize Cost" variant="outlined" />
                    <Chip label="Maximize Protein" variant="outlined" />
                    <Chip label="Optimize Energy" variant="outlined" />
                    <Chip label="Balance Nutrients" variant="outlined" />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<OptimizeIcon />}
                  onClick={handleOptimize}
                  disabled={optimizing}
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  {optimizing ? 'Optimizing Formula...' : 'Start Optimization'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Optimization History
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Starter Pro v2.1"
                      secondary="Cost reduced by 8.5%"
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="caption" color="success.main">
                        +8.5%
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Grower Max v1.3"
                      secondary="Protein increased to 18.8%"
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="caption" color="primary.main">
                        +2.1%
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* New Formula Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create New Formula</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Formula Name"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Animal Type</InputLabel>
                <Select label="Animal Type" sx={{ borderRadius: 2 }}>
                  <MenuItem value="poultry">Poultry</MenuItem>
                  <MenuItem value="swine">Swine</MenuItem>
                  <MenuItem value="cattle">Cattle</MenuItem>
                  <MenuItem value="fish">Fish</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Stage</InputLabel>
                <Select label="Stage" sx={{ borderRadius: 2 }}>
                  <MenuItem value="starter">Starter</MenuItem>
                  <MenuItem value="grower">Grower</MenuItem>
                  <MenuItem value="finisher">Finisher</MenuItem>
                  <MenuItem value="layer">Layer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Protein (%)"
                type="number"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Create Formula
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormulaManagementPage;