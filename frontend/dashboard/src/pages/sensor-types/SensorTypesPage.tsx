import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Chip, Grid, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Sensors as SensorIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';

interface SensorType {
  id: string;
  name: string;
  unit: string;
  description: string;
}

const mockSensorTypes: SensorType[] = [
  { id: '1', name: 'Temperature', unit: '°C', description: 'Measures temperature' },
  { id: '2', name: 'Humidity', unit: '%', description: 'Measures relative humidity' },
  { id: '3', name: 'CO2', unit: 'ppm', description: 'Measures carbon dioxide levels' },
];

const sensorTypeService = {
  getSensorTypes: async (): Promise<SensorType[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockSensorTypes), 500));
  },
};

const SensorTypesPage: React.FC = () => {
    const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<SensorType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        sensorTypeService.getSensorTypes()
            .then(res => setSensorTypes(res))
            .catch(() => setError('Failed to load sensor types.'))
            .finally(() => setLoading(false));
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: SensorType) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: SensorType) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredSensorTypes = sensorTypes.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'fontWeightBold' }}>Sensor Type Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all sensor types for your devices.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Sensor Type</Button>
            </Box>

            <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search Sensor Types..."
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSensorTypes.length > 0 ? filteredSensorTypes.map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'warning.light' }}><SensorIcon /></Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>{item.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={item.unit} size="small" /></TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <NoData message="No sensor types found. Try adjusting your search." />
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
                    <DialogTitle>{editingItem ? 'Edit Sensor Type' : 'Add New Sensor Type'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Sensor Type Name" defaultValue={editingItem?.name || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField margin="dense" label="Unit" defaultValue={editingItem?.unit || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField margin="dense" label="Description" defaultValue={editingItem?.description || ''} fullWidth multiline rows={3} />
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

export default SensorTypesPage;
