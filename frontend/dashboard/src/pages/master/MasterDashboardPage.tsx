// Master Dashboard Page
// Main dashboard for master data management
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Agriculture as FarmIcon,
  Devices as DeviceIcon,
  Pets as AnimalIcon,
  Home as HouseIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useMasterData } from '../../hooks/useMasterData';
import { Customer, Farm, Device, Animal, House } from '../../types/api';

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
      id={`master-tabpanel-${index}`}
      aria-labelledby={`master-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function MasterDashboardPage() {
  const [tabValue, setTabValue] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const {
    // Data
    customers,
    farms,
    devices,
    animals,
    houses,
    
    // Loading states
    loading,
    customersLoading,
    farmsLoading,
    devicesLoading,
    animalsLoading,
    housesLoading,
    
    // Error state
    error,
    
    // Computed values
    totalCustomers,
    totalFarms,
    totalDevices,
    totalAnimals,
    totalHouses,
    activeFarms,
    activeDevices,
    activeAnimals,
    
    // Actions
    fetchAll,
  } = useMasterData({ 
    autoRefresh: true, 
    refreshInterval: 60000 // 1 minute
  });

  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await fetchAll();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = loading || customersLoading || farmsLoading || devicesLoading || animalsLoading || housesLoading;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Master Data Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customers, farms, devices, animals, and houses
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <IconButton 
            onClick={handleRefresh} 
            disabled={isLoading}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {totalCustomers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FarmIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {totalFarms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Farms
              </Typography>
              <Chip 
                label={`${activeFarms} active`} 
                size="small" 
                color="success" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DeviceIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {totalDevices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Devices
              </Typography>
              <Chip 
                label={`${activeDevices} active`} 
                size="small" 
                color="info" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AnimalIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {totalAnimals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Animals
              </Typography>
              <Chip 
                label={`${activeAnimals} active`} 
                size="small" 
                color="warning" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HouseIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {totalHouses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Houses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PeopleIcon />} 
            label={`Customers (${totalCustomers})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<FarmIcon />} 
            label={`Farms (${totalFarms})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<HouseIcon />} 
            label={`Houses (${totalHouses})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<DeviceIcon />} 
            label={`Devices (${totalDevices})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<AnimalIcon />} 
            label={`Animals (${totalAnimals})`} 
            iconPosition="start"
          />
        </Tabs>

        {/* Customers Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {customers.map((customer) => (
              <Grid item xs={12} sm={6} md={4} key={customer.id}>
                <Card>
                  <CardHeader
                    title={customer.name}
                    subheader={customer.email}
                    action={
                      <Chip 
                        label={customer.isActive ? 'Active' : 'Inactive'} 
                        color={customer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Phone: {customer.phone || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Address: {customer.address || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Created: {new Date(customer.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Farms Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {farms.map((farm) => (
              <Grid item xs={12} sm={6} md={4} key={farm.id}>
                <Card>
                  <CardHeader
                    title={farm.name}
                    subheader={farm.location}
                    action={
                      <Chip 
                        label={farm.isActive ? 'Active' : 'Inactive'} 
                        color={farm.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {farm.type || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Size: {farm.size ? `${farm.size} ไร่` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Created: {new Date(farm.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Houses Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            {houses.map((house) => (
              <Grid item xs={12} sm={6} md={4} key={house.id}>
                <Card>
                  <CardHeader
                    title={house.name}
                    subheader={`Farm ID: ${house.farmId}`}
                    action={
                      <Chip 
                        label={house.isActive ? 'Active' : 'Inactive'} 
                        color={house.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {house.type || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Capacity: {house.capacity ? `${house.capacity} animals` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Created: {new Date(house.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Devices Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2}>
            {devices.map((device) => (
              <Grid item xs={12} sm={6} md={4} key={device.id}>
                <Card>
                  <CardHeader
                    title={device.name || device.serialNumber}
                    subheader={`Farm ID: ${device.farmId}`}
                    action={
                      <Chip 
                        label={device.isActive ? 'Active' : 'Inactive'} 
                        color={device.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Serial: {device.serialNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type: {device.deviceTypeId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Created: {new Date(device.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Animals Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2}>
            {animals.map((animal) => (
              <Grid item xs={12} sm={6} md={4} key={animal.id}>
                <Card>
                  <CardHeader
                    title={animal.tagNumber}
                    subheader={`Farm ID: ${animal.farmId}`}
                    action={
                      <Chip 
                        label={animal.isActive ? 'Active' : 'Inactive'} 
                        color={animal.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Breed: {animal.breed || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Gender: {animal.gender || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Weight: {animal.weight ? `${animal.weight} kg` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status: {animal.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Created: {new Date(animal.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
