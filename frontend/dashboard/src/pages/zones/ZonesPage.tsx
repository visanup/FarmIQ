import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Place as ZoneIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

interface Zone {
  id: string;
  name: string;
  house: string;
  farm: string;
}

const mockZones: Zone[] = [
  { id: '1', name: 'Zone A1', house: 'House 1', farm: 'Farm Alpha' },
  { id: '2', name: 'Zone A2', house: 'House 1', farm: 'Farm Alpha' },
  { id: '3', name: 'Zone B1', house: 'House 2', farm: 'Farm Beta' },
];

const zoneService = {
  getZones: async (): Promise<Zone[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockZones), 500));
  },
};

const ZonesPage: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Zone | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        zoneService.getZones()
            .then(res => setZones(res))
            .catch(() => setError('Failed to load zones.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: Zone) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: Zone) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredZones = zones.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.farm.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Zone Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all zones within your houses.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Zone</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Zones..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Farm</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredZones.length > 0 ? filteredZones.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'success.light' }}><ZoneIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{item.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.house}</TableCell>
                                    <TableCell>{item.farm}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <NoData message="No zones found. Try adjusting your search." />
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
                    <DialogTitle>{editingItem ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Zone Name" defaultValue={editingItem?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="House" defaultValue={editingItem?.house || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Farm" defaultValue={editingItem?.farm || ''} fullWidth />
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

export default ZonesPage;
