// Animals Page - Connected to Master Service
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, Chip, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Pets as AnimalIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { masterServiceClient } from '../../services/api';
import { Animal } from '../../types/api';
import { safeRenderValue, safeRenderBoolean, safeRenderNumber } from '../../utils/displayUtils';

const AnimalsPage: React.FC = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Animal | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAnimals();
    }, []);

    const loadAnimals = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await masterServiceClient.getAnimals();
            setAnimals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load animals.');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: Animal) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: Animal) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredAnimals = animals.filter(animal =>
        animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
        animal.farmId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Animal Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all animals in your farms.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Animal</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Animals..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Tag Number</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Breed</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Gender</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Weight</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAnimals.length > 0 ? filteredAnimals.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'warning.light' }}><AnimalIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{item.tagNumber}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{safeRenderValue(item.breed)}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{safeRenderValue(item.gender)}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                        {safeRenderNumber(item.weight, 'kg')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={safeRenderBoolean(item.isActive)} 
                                            color={item.isActive ? 'success' : 'default'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <NoData message="No animals found. Try adjusting your search." />
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
                    <DialogTitle>{editingItem ? 'Edit Animal' : 'Add New Animal'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <TextField label="Tag Number" defaultValue={editingItem?.tagNumber || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Breed" defaultValue={editingItem?.breed || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Gender" defaultValue={editingItem?.gender || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Weight (kg)" type="number" defaultValue={editingItem?.weight || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Farm ID" defaultValue={editingItem?.farmId || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="House ID" defaultValue={editingItem?.houseId || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Status" defaultValue={editingItem?.status || ''} fullWidth />
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

export default AnimalsPage;
