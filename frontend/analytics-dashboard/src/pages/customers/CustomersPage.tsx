import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useCustomers, useFarms } from '../../hooks/useApi';
import { Customer, Farm } from '../../types/api';

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
      id={`customers-tabpanel-${index}`}
      aria-labelledby={`customers-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomersPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: farms = [], isLoading: farmsLoading } = useFarms();

  const handleOpenDialog = (mode: 'create' | 'edit' | 'view', customer?: Customer) => {
    setDialogMode(mode);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving customer:', formData);
    handleCloseDialog();
  };

  const getCustomerFarms = (customerId: string) => {
    return farms.filter(farm => farm.id.startsWith(customerId));
  };

  const getCustomerStats = (customerId: string) => {
    const customerFarms = getCustomerFarms(customerId);
    const totalFarms = customerFarms.length;
    const activeFarms = customerFarms.filter(farm => farm.isActive).length;
    const totalSize = customerFarms.reduce((sum, farm) => sum + farm.size, 0);
    
    return {
      totalFarms,
      activeFarms,
      totalSize,
    };
  };

  if (customersLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>กำลังโหลดข้อมูลลูกค้า...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              จัดการลูกค้า
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ดูและจัดการข้อมูลลูกค้าทั้งหมดในระบบ
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{ borderRadius: 2 }}
          >
            เพิ่มลูกค้าใหม่
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{customers.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ลูกค้าทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {customers.filter(c => c.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ลูกค้าที่ใช้งาน
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{farms.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ฟาร์มทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {farms.reduce((total, farm) => total + farm.size, 0).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ไร่ทั้งหมด
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="รายการลูกค้า" />
              <Tab label="ตารางข้อมูล" />
            </Tabs>
          </Box>

          {/* Customers Grid Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {customers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                const customerFarms = getCustomerFarms(customer.id);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={customer.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" component="h3">
                                {customer.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {customer.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={customer.isActive ? 'ใช้งาน' : 'หยุดใช้งาน'}
                            color={customer.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.email}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                          <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="flex-start" mb={2}>
                          <LocationIcon color="action" sx={{ mr: 1, fontSize: 20, mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.address}
                          </Typography>
                        </Box>

                        {/* Stats */}
                        <Grid container spacing={2} mb={2}>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary">
                                {stats.totalFarms}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ฟาร์ม
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="secondary">
                                {stats.activeFarms}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ใช้งาน
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="info">
                                {stats.totalSize.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ไร่
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Farms List */}
                        {customerFarms.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              ฟาร์ม:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {customerFarms.slice(0, 3).map((farm) => (
                                <Chip
                                  key={farm.id}
                                  label={farm.name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                              {customerFarms.length > 3 && (
                                <Chip
                                  label={`+${customerFarms.length - 3}`}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleOpenDialog('view', customer)}
                            fullWidth
                          >
                            ดูรายละเอียด
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', customer)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => console.log('Delete customer:', customer.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>

          {/* Table Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell>อีเมล</TableCell>
                    <TableCell>โทรศัพท์</TableCell>
                    <TableCell>ที่อยู่</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>ฟาร์ม</TableCell>
                    <TableCell>ขนาดรวม</TableCell>
                    <TableCell>การดำเนินการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => {
                    const stats = getCustomerStats(customer.id);
                    
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {customer.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {customer.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <EmailIcon color="action" sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {customer.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <PhoneIcon color="action" sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {customer.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={customer.address}>
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {customer.address}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={customer.isActive ? 'ใช้งาน' : 'หยุดใช้งาน'}
                            color={customer.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stats.totalFarms} ฟาร์ม
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stats.totalSize.toFixed(1)} ไร่
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('view', customer)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', customer)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => console.log('Delete customer:', customer.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Customer Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' && 'เพิ่มลูกค้าใหม่'}
            {dialogMode === 'edit' && 'แก้ไขข้อมูลลูกค้า'}
            {dialogMode === 'view' && 'รายละเอียดลูกค้า'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="ชื่อบริษัท/ลูกค้า"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="โทรศัพท์"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="ที่อยู่"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                margin="normal"
                disabled={dialogMode === 'view'}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {dialogMode !== 'view' && (
              <Button onClick={handleSave} variant="contained">
                {dialogMode === 'create' ? 'เพิ่ม' : 'บันทึก'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CustomersPage;

