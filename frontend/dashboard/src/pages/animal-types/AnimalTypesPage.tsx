import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Grid, InputAdornment,
  Pagination, Card, CardContent, Fade, Zoom, useTheme
} from '@mui/material';
import { Chip } from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Category as CategoryIcon, Search as SearchIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { masterServiceClient } from '../../services/api';
import { AnimalType } from '../../types/api';
import { safeRenderValue, safeRenderBoolean } from '../../utils/displayUtils';

const AnimalTypesPage: React.FC = () => {
    const theme = useTheme();
    const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAnimalType, setEditingAnimalType] = useState<AnimalType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const itemsPerPage = 10;

    useEffect(() => {
        loadAnimalTypes();
    }, []);

    const loadAnimalTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await masterServiceClient.getAnimalTypes();
            setAnimalTypes(data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load animal types.');
        } finally {
            setLoading(false);
        }
    };

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
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAnimalTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAnimalTypes = filteredAnimalTypes.slice(startIndex, endIndex);

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);
    const handleRefresh = () => loadAnimalTypes();

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
        <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', boxShadow: '0 4px 15px rgba(255,152,0,0.4)' }}>
                      <CategoryIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>จัดการชนิดสัตว์</Typography>
                      <Typography variant="h6" sx={{ color: 'text.secondary' }}>จัดการชนิดสัตว์สำหรับองค์กรของคุณ</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}</Typography>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>รีเฟรช</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มชนิดสัตว์</Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Fade>

          {/* Search */}
          <Fade in timeout={600}>
            <Box sx={{ p: 3 }}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <TextField
                    variant="outlined"
                    size="medium"
                    placeholder="ค้นหาชนิดสัตว์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                    sx={{ width: { xs: '100%', sm: 400 } }}
                  />
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Table */}
          <Fade in timeout={800}>
            <Box sx={{ px: 3, mb: 4 }}>
              <Card sx={{ borderRadius: 4 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                      <TableRow>
                        <TableCell>ชื่อชนิดสัตว์</TableCell>
                        <TableCell>หมวดหมู่</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>คำอธิบาย</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align="right">การดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentAnimalTypes.length > 0 ? currentAnimalTypes.map((animalType, index) => (
                        <Zoom in timeout={600 + (index * 100)} key={animalType.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)' }}><CategoryIcon /></Avatar>
                                <Typography sx={{ fontWeight: 600 }}>{animalType.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{safeRenderValue(animalType.category)}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{safeRenderValue(animalType.description)}</TableCell>
                            <TableCell>
                              <Chip label={animalType.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'} color={animalType.isActive ? 'success' : 'default'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton onClick={(e) => handleMenuClick(e, animalType)}><MoreVertIcon /></IconButton>
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <NoData message="ไม่พบข้อมูลชนิดสัตว์" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          </Fade>

          {/* Pagination */}
          {totalPages > 1 && (
            <Fade in timeout={1000}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Card sx={{ p: 2, borderRadius: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">แสดง {startIndex + 1}-{Math.min(endIndex, filteredAnimalTypes.length)} จาก {filteredAnimalTypes.length} รายการ</Typography>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
                  </Box>
                </Card>
              </Box>
            </Fade>
          )}

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
