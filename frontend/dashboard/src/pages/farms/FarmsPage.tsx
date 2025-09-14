import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, Chip, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Agriculture as FarmIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

interface Farm {
  id: string;
  name: string;
  location: string;
  customer: string;
  status: 'active' | 'inactive';
}

const mockFarms: Farm[] = [
  { id: '1', name: 'Alpha Farm', location: 'North Valley', customer: 'Broiler Inc.', status: 'active' },
  { id: '2', name: 'Beta Farm', location: 'South Hills', customer: 'Layer Co.', status: 'inactive' },
  { id: '3', name: 'Gamma Farm', location: 'East Plains', customer: 'Broiler Inc.', status: 'active' },
];

const farmService = {
  getFarms: async (): Promise<Farm[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockFarms), 500));
  },
};


const FarmsPage: React.FC = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Farm | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        farmService.getFarms()
            .then(res => setFarms(res))
            .catch(() => setError('Failed to load farms.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: Farm) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: Farm) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredFarms = farms.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Farm Management</Typography>
                    <Typography variant="body2" color="text.secondary">Oversee all farms in your network.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Farm</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Farms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Farm Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFarms.length > 0 ? filteredFarms.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'success.light' }}><FarmIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{item.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.customer}</TableCell>
                                    <TableCell>
                                        <Chip label={item.status} color={item.status === 'active' ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <NoData message="No farms found. Try adjusting your search." />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleOpenDialog(editingItem!)}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit</MenuItem>
                <MenuItem sx={{ color: 'error.main' }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete</MenuItem>
            </Menu>

            {openDialog && (
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingItem ? 'Edit Farm' : 'Add New Farm'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <TextField label="Farm Name" defaultValue={editingItem?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Location" defaultValue={editingItem?.location || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Customer" defaultValue={editingItem?.customer || ''} fullWidth />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: '0 24px 16px' }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button variant="contained">Save Changes</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
      </DashboardLayout>
    );
};

export default FarmsPage;

