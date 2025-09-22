import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Avatar, Chip, Grid, InputAdornment,
  Pagination, Card, CardContent, Fade, Zoom, useTheme
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Api as ApiIcon, Search as SearchIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { masterServiceClient } from '../../services/api';
import { safeRenderValue, safeRenderBoolean } from '../../utils/displayUtils';

interface ExternalDataSource {
  id: string;
  name: string;
  type: 'API' | 'Database' | 'File';
  endpoint: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ExternalDataSourcesPage: React.FC = () => {
    const theme = useTheme();
    const [dataSources, setDataSources] = useState<ExternalDataSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<ExternalDataSource | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const itemsPerPage = 10;

    useEffect(() => {
        loadDataSources();
    }, []);

    const loadDataSources = async () => {
        try {
            setLoading(true);
            setError(null);
            // Note: This would need to be implemented in Master Service
            // For now, we'll use mock data but with proper structure
            const mockData: ExternalDataSource[] = [
                { 
                    id: '1', 
                    name: 'Weather API', 
                    type: 'API', 
                    endpoint: 'https://api.weather.com/v1',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '2', 
                    name: 'Market Prices DB', 
                    type: 'Database', 
                    endpoint: 'db.market.internal',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '3', 
                    name: 'Govt Livestock Data', 
                    type: 'File', 
                    endpoint: '/mnt/data/livestock.csv',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '4', 
                    name: 'Thai Meteorological Department', 
                    type: 'API', 
                    endpoint: 'https://api.tmd.go.th/v1',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '5', 
                    name: 'Feed Price Index', 
                    type: 'API', 
                    endpoint: 'https://api.feedprices.com/v2',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '6', 
                    name: 'Livestock Registry', 
                    type: 'Database', 
                    endpoint: 'db.livestock.gov.th',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '7', 
                    name: 'Export Data CSV', 
                    type: 'File', 
                    endpoint: '/data/exports/monthly.csv',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '8', 
                    name: 'Disease Outbreak API', 
                    type: 'API', 
                    endpoint: 'https://api.disease.gov.th/alerts',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '9', 
                    name: 'Market Analysis DB', 
                    type: 'Database', 
                    endpoint: 'db.analysis.internal',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '10', 
                    name: 'Historical Data Archive', 
                    type: 'File', 
                    endpoint: '/archive/historical/',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '11', 
                    name: 'Real-time Market Feed', 
                    type: 'API', 
                    endpoint: 'https://api.marketfeed.live/prices',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                { 
                    id: '12', 
                    name: 'Government Statistics', 
                    type: 'API', 
                    endpoint: 'https://api.nso.go.th/agriculture',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
            ];
            setDataSources(mockData);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data sources.');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: ExternalDataSource) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDialog = (item?: ExternalDataSource) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    const filteredDataSources = dataSources.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDataSources.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDataSources = filteredDataSources.slice(startIndex, endIndex);

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);
    const handleRefresh = () => loadDataSources();

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
      <DashboardLayout>
        <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
          {/* Header */}
          <Fade in timeout={800}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FF5722 0%, #FF8A65 100%)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)', boxShadow: '0 4px 15px rgba(255,87,34,0.4)' }}>
                      <ApiIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>จัดการแหล่งข้อมูลภายนอก</Typography>
                      <Typography variant="h6" sx={{ color: 'text.secondary' }}>จัดการแหล่งข้อมูลจากภายนอกระบบ</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}</Typography>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>รีเฟรช</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มแหล่งข้อมูล</Button>
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
                    placeholder="ค้นหาแหล่งข้อมูล..."
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
                        <TableCell>ชื่อแหล่งข้อมูล</TableCell>
                        <TableCell>ประเภท</TableCell>
                        <TableCell>Endpoint / Path</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align="right">การดำเนินการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentDataSources.length > 0 ? currentDataSources.map((item, index) => (
                        <Zoom in timeout={600 + (index * 100)} key={item.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)' }}><ApiIcon /></Avatar>
                                <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={item.type} 
                                size="small" 
                                color={item.type === 'API' ? 'primary' : item.type === 'Database' ? 'secondary' : 'default'} 
                              />
                            </TableCell>
                            <TableCell>{safeRenderValue(item.endpoint)}</TableCell>
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
                            <NoData message="ไม่พบข้อมูลแหล่งข้อมูล" />
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
                    <Typography variant="body2" color="text.secondary">แสดง {startIndex + 1}-{Math.min(endIndex, filteredDataSources.length)} จาก {filteredDataSources.length} รายการ</Typography>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
                  </Box>
                </Card>
              </Box>
            </Fade>
          )}

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleOpenDialog(editingItem!)}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>แก้ไข</MenuItem>
            <MenuItem sx={{ color: 'error.main' }}><ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>ลบ</MenuItem>
          </Menu>

          {openDialog && (
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)', color: 'white' }}>
                {editingItem ? 'แก้ไขแหล่งข้อมูล' : 'เพิ่มแหล่งข้อมูลใหม่'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField margin="dense" label="ชื่อแหล่งข้อมูล" defaultValue={editingItem?.name || ''} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField margin="dense" label="ประเภท" defaultValue={editingItem?.type || 'API'} select SelectProps={{ native: true }} fullWidth>
                      <option>API</option>
                      <option>Database</option>
                      <option>File</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField margin="dense" label="Endpoint / Path" defaultValue={editingItem?.endpoint || ''} fullWidth />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleCloseDialog}>ยกเลิก</Button>
                <Button variant="contained">บันทึกการเปลี่ยนแปลง</Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      </DashboardLayout>
    );
};

export default ExternalDataSourcesPage;
