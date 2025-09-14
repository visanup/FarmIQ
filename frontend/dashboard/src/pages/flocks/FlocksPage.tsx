import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Groups as FlockIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

interface Flock {
  id: string;
  name: string;
  house: string;
  breed: string;
  quantity: number;
}

const mockFlocks: Flock[] = [
  { id: '1', name: 'Flock-A1-2024', house: 'Broiler House 01', breed: 'Ross 308', quantity: 5000 },
  { id: '2', name: 'Flock-L-A-2024', house: 'Layer House A', breed: 'Lohmann Brown', quantity: 3000 },
  { id: '3', name: 'Flock-A2-2024', house: 'Broiler House 02', breed: 'Cobb 500', quantity: 5200 },
];

const flockService = {
  getFlocks: async (): Promise<Flock[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockFlocks), 500));
  },
};

const FlocksPage: React.FC = () => {
    const [flocks, setFlocks] = useState<Flock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Flock | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        flockService.getFlocks()
            .then(res => setFlocks(res))
            .catch(() => setError('Failed to load flocks.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: Flock) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: Flock) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredFlocks = flocks.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Flock Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all flocks within your houses.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Flock</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Flocks..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>House</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Breed</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFlocks.length > 0 ? filteredFlocks.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'info.light' }}><FlockIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{item.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.house}</TableCell>
                                    <TableCell>{item.breed}</TableCell>
                                    <TableCell>{item.quantity.toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <NoData message="No flocks found. Try adjusting your search." />
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
                    <DialogTitle>{editingItem ? 'Edit Flock' : 'Add New Flock'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Flock Name" defaultValue={editingItem?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="House" defaultValue={editingItem?.house || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Breed" defaultValue={editingItem?.breed || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Quantity" defaultValue={editingItem?.quantity || 0} type="number" fullWidth />
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

export default FlocksPage;
