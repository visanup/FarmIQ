import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Chip, Grid, InputAdornment,
  Pagination, Card, CardContent, Fade, Zoom, useTheme
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Sensors as SensorIcon, Search as SearchIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { masterServiceClient } from '../../services/api';
import { SensorType } from '../../types/api';
import { safeRenderValue, safeRenderBoolean } from '../../utils/displayUtils';

const SensorTypesPage: React.FC = () => {
    const theme = useTheme();
    const [sensorTypes, setSensorTypes] = useState<SensorType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<SensorType | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const itemsPerPage = 10;

    useEffect(() => {
        loadSensorTypes();
    }, []);

    const loadSensorTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await masterServiceClient.getSensorTypes();
            setSensorTypes(data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sensor types.');
        } finally {
            setLoading(false);
        }
    };

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
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSensorTypes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSensorTypes = filteredSensorTypes.slice(startIndex, endIndex);

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);
    const handleRefresh = () => loadSensorTypes();

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FF7043 0%, #FFA726 100%)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FF7043 0%, #FFA726 100%)', boxShadow: '0 4px 15px rgba(255,112,67,0.4)' }}>
                      <SensorIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #FF7043 0%, #FFA726 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>จัดการประเภทเซนเซอร์</Typography>
                      <Typography variant="h6" sx={{ color: 'text.secondary' }}>จัดการประเภทเซนเซอร์สำหรับอุปกรณ์ของคุณ</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}</Typography>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>รีเฟรช</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มประเภท</Button>
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
                    placeholder="ค้นหาประเภทเซนเซอร์..."
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
                        <TableCell>ชื่อประเภท</TableCell>
                        <TableCell>หน่วย</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>คำอธิบาย</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align="right">การดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSensorTypes.length > 0 ? currentSensorTypes.map((item, index) => (
                        <Zoom in timeout={600 + (index * 100)} key={item.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(135deg, #FF7043 0%, #FFA726 100%)' }}><SensorIcon /></Avatar>
                                <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Chip label={safeRenderValue(item.unit)} size="small" /></TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{safeRenderValue(item.description)}</TableCell>
                            <TableCell>
                              <Chip label={item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'} color={item.isActive ? 'success' : 'default'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton onClick={(e) => handleMenuClick(e, item)}><MoreVertIcon /></IconButton>
                            </TableCell>
                          </TableRow>
                        </Zoom>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <NoData message="ไม่พบข้อมูลประเภทเซนเซอร์" />
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
                    <Typography variant="body2" color="text.secondary">แสดง {startIndex + 1}-{Math.min(endIndex, filteredSensorTypes.length)} จาก {filteredSensorTypes.length} รายการ</Typography>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
                  </Box>
                </Card>
              </Box>
            </Fade>
          )}

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
