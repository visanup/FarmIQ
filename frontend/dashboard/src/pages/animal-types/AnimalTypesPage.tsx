import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Category as CategoryIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

// Mock data and service
interface AnimalType {
  id: string;
  name: string;
  category: string;
  description: string;
}

const mockAnimalTypes: AnimalType[] = [
  { id: '1', name: 'Chicken', category: 'Poultry', description: 'Domesticated fowl' },
  { id: '2', name: 'Pig', category: 'Livestock', description: 'Omnivorous hoofed mammal' },
  { id: '3', name: 'Cattle', category: 'Livestock', description: 'Domesticated bovine animals' },
];

const animalTypeService = {
  getAnimalTypes: async (): Promise<AnimalType[]> => {
    console.log('Fetching animal types...');
    return new Promise(resolve => setTimeout(() => resolve(mockAnimalTypes), 500));
  },
};

const AnimalTypesPage: React.FC = () => {
    const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAnimalType, setEditingAnimalType] = useState<AnimalType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        animalTypeService.getAnimalTypes()
            .then(res => setAnimalTypes(res))
            .catch(() => setError('Failed to load animal types.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, animalType: AnimalType) => {
        setAnchorEl(event.currentTarget);
        setEditingAnimalType(animalType);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (animalType?: AnimalType) => {
        setEditingAnimalType(animalType || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredAnimalTypes = animalTypes.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Animal Type Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all animal types for your organization.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Animal Type</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Animal Types..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAnimalTypes.length > 0 ? filteredAnimalTypes.map((animalType) => (
                                <TableRow key={animalType.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'secondary.light' }}><CategoryIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{animalType.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{animalType.category}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{animalType.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, animalType)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <NoData message="No animal types found. Try adjusting your search." />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleOpenDialog(editingAnimalType!)}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit Animal Type</MenuItem>
                <MenuItem sx={{ color: 'error.main' }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete Animal Type</MenuItem>
            </Menu>

            {openDialog && (
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingAnimalType ? 'Edit Animal Type' : 'Add New Animal Type'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Animal Type Name" defaultValue={editingAnimalType?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Category" defaultValue={editingAnimalType?.category || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Description" defaultValue={editingAnimalType?.description || ''} fullWidth multiline rows={3} />
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

export default AnimalTypesPage;
