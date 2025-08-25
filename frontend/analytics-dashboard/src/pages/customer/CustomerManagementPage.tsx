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
  Avatar,
  IconButton,
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
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Subscriptions as SubscriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ContactPhone as ContactIcon,
} from '@mui/icons-material';
import { customerService, type Customer, type Subscription, type Contact } from '@/services/customer/customerService';

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

const CustomerManagementPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerDetails(selectedCustomer.customer_id);
    }
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomers({ limit: 100 });
      setCustomers(response.data);
      if (response.data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(response.data[0]);
      }
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: number) => {
    try {
      const [subs, customerContacts] = await Promise.all([
        customerService.getSubscriptions(),
        customerService.getCustomerContacts(customerId)
      ]);
      
      setSubscriptions(subs.filter(s => s.customer_id === customerId));
      setContacts(customerContacts);
    } catch (err) {
      setError('Failed to load customer details');
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const created = await customerService.createCustomer(customerForm);
      setCustomers([...customers, created]);
      setCustomerDialogOpen(false);
      resetCustomerForm();
    } catch (err) {
      setError('Failed to create customer');
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    try {
      const updated = await customerService.updateCustomer(editingCustomer.customer_id, customerForm);
      setCustomers(customers.map(c => c.customer_id === updated.customer_id ? updated : c));
      if (selectedCustomer?.customer_id === updated.customer_id) {
        setSelectedCustomer(updated);
      }
      setCustomerDialogOpen(false);
      resetCustomerForm();
    } catch (err) {
      setError('Failed to update customer');
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({ name: '', email: '', phone: '', address: '' });
    setEditingCustomer(null);
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setCustomerDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'canceled': return 'error';
      case 'expired': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customers, subscriptions, and billing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCustomerDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customer List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Customers ({customers.length})
              </Typography>
              <List>
                {customers.map((customer) => (
                  <ListItem
                    key={customer.customer_id}
                    button
                    selected={selectedCustomer?.customer_id === customer.customer_id}
                    onClick={() => setSelectedCustomer(customer)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={customer.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {customer.email}
                          </Typography>
                          <Chip
                            label={customer.status}
                            size="small"
                            color={getStatusColor(customer.status) as any}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCustomer(customer);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Details */}
        <Grid item xs={12} md={8}>
          {selectedCustomer ? (
            <Card>
              <CardContent>
                {/* Customer Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 56, height: 56 }}>
                      <BusinessIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {selectedCustomer.name}
                      </Typography>
                      <Chip
                        label={selectedCustomer.status}
                        color={getStatusColor(selectedCustomer.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <IconButton onClick={() => openEditCustomer(selectedCustomer)}>
                    <EditIcon />
                  </IconButton>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <SubscriptionIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {subscriptions.filter(s => s.status === 'active').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Active Subscriptions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <ContactIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {contacts.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Contacts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          --
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <PaymentIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ${subscriptions.reduce((sum, s) => sum + (s.meta?.monthly_fee || 0), 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monthly Revenue
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Tabs */}
                <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ mb: 2 }}>
                  <Tab label="Overview" />
                  <Tab label="Subscriptions" />
                  <Tab label="Contacts" />
                </Tabs>

                {/* Tab Content */}
                <TabPanel value={currentTab} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Customer Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><EmailIcon /></ListItemIcon>
                          <ListItemText primary="Email" secondary={selectedCustomer.email || 'Not provided'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><PhoneIcon /></ListItemIcon>
                          <ListItemText primary="Phone" secondary={selectedCustomer.phone || 'Not provided'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationIcon /></ListItemIcon>
                          <ListItemText primary="Address" secondary={selectedCustomer.address || 'Not provided'} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Billing Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCustomer.billing_info ? 
                          JSON.stringify(selectedCustomer.billing_info, null, 2) : 
                          'No billing information available'
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Subscriptions
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Plan</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subscriptions.map((subscription) => (
                          <TableRow key={subscription.subscription_id}>
                            <TableCell>{subscription.plan_code}</TableCell>
                            <TableCell>
                              <Chip
                                label={subscription.status}
                                color={getStatusColor(subscription.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'No end date'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Contacts
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Role</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.contact_id}>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>
                              <Chip label={contact.role || 'N/A'} size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Select a customer to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
          >
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagementPage;