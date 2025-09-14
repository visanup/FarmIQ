import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Chip, Grid, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Pets as PetsIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

// Mock data and service
interface Breed {
  id: string;
  name: string;
  animalType: string;
  description: string;
}

const mockBreeds: Breed[] = [
  { id: '1', name: 'Ross 308', animalType: 'Chicken', description: 'Popular broiler breed' },
  { id: '2', name: 'Cobb 500', animalType: 'Chicken', description: 'Another popular broiler breed' },
  { id: '3', name: 'Large White', animalType: 'Pig', description: 'Common breed of domestic pig' },
];

const breedService = {
  getBreeds: async (): Promise<Breed[]> => {
    console.log('Fetching breeds...');
    return new Promise(resolve => setTimeout(() => resolve(mockBreeds), 500));
  },
};

const BreedsPage: React.FC = () => {
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        breedService.getBreeds()
            .then(res => setBreeds(res))
            .catch(() => setError('Failed to load breeds.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, breed: Breed) => {
        setAnchorEl(event.currentTarget);
        setEditingBreed(breed);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (breed?: Breed) => {
        setEditingBreed(breed || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredBreeds = breeds.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.animalType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
      return (
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        </DashboardLayout>
      );
    }
    
    if (error) {
      return (
        <DashboardLayout>
          <Alert severity="error">{error}</Alert>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Breed Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all animal breeds for your organization.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Breed</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Breeds..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Animal Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBreeds.length > 0 ? filteredBreeds.map((breed) => (
                                <TableRow key={breed.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'info.light' }}><PetsIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{breed.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={breed.animalType} size="small" /></TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{breed.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, breed)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <NoData message="No breeds found. Try adjusting your search." />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleOpenDialog(editingBreed!)}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit Breed</MenuItem>
                <MenuItem sx={{ color: 'error.main' }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete Breed</MenuItem>
            </Menu>

            {openDialog && (
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingBreed ? 'Edit Breed' : 'Add New Breed'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Breed Name" defaultValue={editingBreed?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Animal Type" defaultValue={editingBreed?.animalType || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Description" defaultValue={editingBreed?.description || ''} fullWidth multiline rows={3} />
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

export default BreedsPage;
