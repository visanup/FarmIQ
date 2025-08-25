import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  useTheme,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';

interface Farm {
  id: string;
  name: string;
  location: string;
  area: number;
  crops: string[];
  status: 'active' | 'inactive' | 'maintenance';
  health: number;
  lastUpdate: string;
  devices: number;
  alerts: number;
  customerId: number; // Add customer ID for filtering
}

// Mock data with customer associations
const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'North Field Farm',
    location: 'Chiang Mai, Thailand',
    area: 50.5,
    crops: ['Rice', 'Corn'],
    status: 'active',
    health: 95,
    lastUpdate: '2 minutes ago',
    devices: 12,
    alerts: 0,
    customerId: 1,
  },
  {
    id: '2',
    name: 'Organic Valley',
    location: 'Nakhon Pathom, Thailand',
    area: 75.2,
    crops: ['Vegetables', 'Herbs'],
    status: 'active',
    health: 87,
    lastUpdate: '5 minutes ago',
    devices: 18,
    alerts: 2,
    customerId: 1,
  },
  {
    id: '3',
    name: 'Greenhouse Complex',
    location: 'Lopburi, Thailand',
    area: 25.8,
    crops: ['Tomatoes', 'Cucumbers'],
    status: 'maintenance',
    health: 60,
    lastUpdate: '1 hour ago',
    devices: 8,
    alerts: 5,
    customerId: 2,
  },
  {
    id: '4',
    name: 'Aquaculture Pond A',
    location: 'Suphan Buri, Thailand',
    area: 30.0,
    crops: ['Tilapia', 'Catfish'],
    status: 'active',
    health: 92,
    lastUpdate: '3 minutes ago',
    devices: 15,
    alerts: 1,
    customerId: 1,
  },
];

const FarmManagementPage: React.FC = () => {
  const theme = useTheme();
  const { state } = useDashboard();
  const [allFarms] = useState<Farm[]>(mockFarms);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  // Filter farms based on current customer
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all farms
      setFarms(allFarms);
    } else if (state.currentCustomer) {
      // Regular customer sees only their farms
      const customerFarms = allFarms.filter(farm => farm.customerId === state.currentCustomer?.id);
      setFarms(customerFarms);
    } else {
      setFarms([]);
    }
  }, [state.currentCustomer, state.isAdmin, allFarms]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'maintenance':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'maintenance':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <WarningIcon sx={{ color: theme.palette.error.main }} />;
    }
  };

  const handleAddFarm = () => {
    setSelectedFarm(null);
    setOpenDialog(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Farm Management
            {state.currentCustomer && !state.isAdmin && (
              <Chip 
                label={`ลูกค้า: ${state.currentCustomer.name}`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
            {state.isAdmin && (
              <Chip 
                label="ผู้ดูแลระบบ - แสดงข้อมูลทั้งหมด"
                color="warning"
                variant="filled"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your farms, monitor operations, and track performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFarm}
          sx={{ borderRadius: 2 }}
          disabled={!state.currentCustomer && !state.isAdmin}
        >
          Add New Farm
        </Button>
      </Box>

      {/* No access message */}
      {!state.currentCustomer && !state.isAdmin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>ไม่สามารถเข้าถึงข้อมูลได้</AlertTitle>
          กรุณาเข้าสู่ระบบเพื่อดูข้อมูลฟาร์มของคุณ
        </Alert>
      )}

      {/* No farms message */}
      {farms.length === 0 && state.currentCustomer && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>ไม่พบข้อมูลฟาร์ม</AlertTitle>
          {state.isAdmin ? 'ไม่มีข้อมูลฟาร์มในระบบ' : 'คุณยังไม่มีฟาร์มที่ลงทะเบียน กรุณาเพิ่มฟาร์มใหม่'}
        </Alert>
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
                <AgricultureIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {farms.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Farms
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
                <LocationIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {farms.reduce((acc, farm) => acc + farm.area, 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Area (ไร่)
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
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {farms.filter(f => f.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Farms
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
                  {farms.reduce((acc, farm) => acc + farm.alerts, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Alerts
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Farms Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Farm Overview
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Farm Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Crops</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Devices</TableCell>
                  <TableCell>Alerts</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {farms.map((farm) => (
                  <TableRow key={farm.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.light,
                            mr: 2,
                            width: 32,
                            height: 32,
                          }}
                        >
                          🌾
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {farm.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Updated {farm.lastUpdate}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{farm.location}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{farm.area} ไร่</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {farm.crops.map((crop, index) => (
                          <Chip
                            key={index}
                            label={crop}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(farm.status)}
                        <Typography
                          variant="body2"
                          sx={{
                            ml: 1,
                            color: getStatusColor(farm.status),
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        >
                          {farm.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={farm.health}
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {farm.health}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{farm.devices}</Typography>
                    </TableCell>
                    <TableCell>
                      {farm.alerts > 0 ? (
                        <Chip
                          label={farm.alerts}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditFarm(farm)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Farm Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFarm ? 'Edit Farm' : 'Add New Farm'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farm Name"
                defaultValue={selectedFarm?.name || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                defaultValue={selectedFarm?.location || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area (ไร่)"
                type="number"
                defaultValue={selectedFarm?.area || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Crops (comma separated)"
                defaultValue={selectedFarm?.crops.join(', ') || ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            {selectedFarm ? 'Update' : 'Add'} Farm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmManagementPage;