// Houses Page - Connected to Master Service
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Menu, MenuItem, ListItemIcon, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, 
  Avatar, Grid, Chip, InputAdornment, Pagination, Card, CardContent, Fade, Zoom,
  alpha, useTheme, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Home as HouseIcon, Search as SearchIcon, LocationOn as LocationIcon,
  Phone as PhoneIcon, Email as EmailIcon, Business as BusinessIcon,
  Refresh as RefreshIcon, FilterList as FilterIcon
} from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import NoData from '../../components/common/NoData';
import { masterServiceClient } from '../../services/api';
import { House } from '../../types/api';
import { safeRenderValue, safeRenderBoolean, safeRenderNumber } from '../../utils/displayUtils';

const HousesPage: React.FC = () => {
    const theme = useTheme();
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<House | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const itemsPerPage = 10;

    useEffect(() => {
        loadHouses();
    }, []);

    const loadHouses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await masterServiceClient.getHouses();
            setHouses(data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load houses.');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: House) => {
        setAnchorEl(event.currentTarget);
        setEditingItem(item);
    };
    const handleMenuClose = () => setAnchorEl(null);

    // Pagination logic
    const filteredHouses = houses.filter(house =>
        house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.farmId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredHouses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentHouses = filteredHouses.slice(startIndex, endIndex);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        loadHouses();
    };

    const handleOpenDialog = (item?: House) => {
        setEditingItem(item || null);
        setOpenDialog(true);
        handleMenuClose();
    };
    const handleCloseDialog = () => setOpenDialog(false);

    if (loading) return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">{error}</Alert></DashboardLayout>;

    return (
        <DashboardLayout>
            <Box sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                minHeight: '100vh',
                position: 'relative',
            }}>
                {/* Header Section */}
                <Fade in={true} timeout={800}>
                    <Box sx={{ 
                        mb: 4, 
                        position: 'relative', 
                        zIndex: 1,
                        p: 3,
                        pb: 0
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3,
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)'
                            }} />
                            <Box sx={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
                                }}>
                                    <HouseIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            mb: 1,
                                            background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        จัดการโรงเรือน
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            opacity: 0.9
                                        }}
                                    >
                                        ดูแลและจัดการโรงเรือนทั้งหมดในฟาร์มของคุณ
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefresh}
                                    sx={{ 
                                        borderRadius: 3,
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: 'primary.dark',
                                            backgroundColor: 'primary.light',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                        }
                                    }}
                                >
                                    รีเฟรช
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    sx={{ 
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                        boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #F57C00 0%, #FFB300 100%)',
                                            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    เพิ่มโรงเรือนใหม่
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Fade>

                {/* Search and Filter Section */}
                <Fade in={true} timeout={600}>
                    <Box sx={{ mb: 4, px: 3 }}>
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                                    }}>
                                        <FilterIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        ค้นหาและกรองข้อมูล
                                    </Typography>
                                </Box>
                                <TextField
                                    variant="outlined"
                                    size="medium"
                                    placeholder="ค้นหาโรงเรือน..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        width: { xs: '100%', sm: 400 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: 'rgba(255,255,255,1)',
                                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                            }
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                </Fade>

                {/* Data Table Section */}
                <Fade in={true} timeout={800}>
                    <Box sx={{ px: 3, mb: 4 }}>
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ 
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                        '& .MuiTableCell-head': {
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            borderBottom: '2px solid',
                                            borderBottomColor: 'primary.main'
                                        }
                                    }}>
                                        <TableRow>
                                            <TableCell>ชื่อโรงเรือน</TableCell>
                                            <TableCell>ฟาร์ม</TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>ประเภท</TableCell>
                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>ความจุ</TableCell>
                                            <TableCell>สถานะ</TableCell>
                                            <TableCell align="right">การดำเนินการ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentHouses.length > 0 ? currentHouses.map((item, index) => (
                                            <Zoom in={true} timeout={600 + (index * 100)} key={item.id}>
                                                <TableRow 
                                                    hover 
                                                    sx={{ 
                                                        '&:last-child td, &:last-child th': { border: 0 },
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                                            transform: 'scale(1.01)',
                                                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)',
                                                        },
                                                        transition: 'all 0.3s ease-in-out'
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar sx={{ 
                                                                bgcolor: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                                                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                                                            }}>
                                                                <HouseIcon />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    ID: {item.id}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="body2">
                                                                {safeRenderValue(item.farmId)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                                        <Typography variant="body2">
                                                            {safeRenderValue(item.type)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {safeRenderNumber(item.capacity)} ตัว
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'} 
                                                            color={item.isActive ? 'success' : 'default'} 
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                borderRadius: 2,
                                                                boxShadow: item.isActive ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton 
                                                            onClick={(e) => handleMenuClick(e, item)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                                    transform: 'scale(1.1)',
                                                                },
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            </Zoom>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                    <NoData message="ไม่พบข้อมูลโรงเรือน" />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Box>
                </Fade>

                {/* Pagination Section */}
                {totalPages > 1 && (
                    <Fade in={true} timeout={1000}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            px: 3,
                            mb: 4
                        }}>
                            <Card sx={{
                                borderRadius: 4,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                p: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        แสดง {startIndex + 1}-{Math.min(endIndex, filteredHouses.length)} จาก {filteredHouses.length} รายการ
                                    </Typography>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                '&.Mui-selected': {
                                                    background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                                    color: 'white',
                                                    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #F57C00 0%, #FFB300 100%)',
                                                    }
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Box>
                    </Fade>
                )}

                {/* Action Menu */}
                <Menu 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255,255,255,0.95)'
                        }
                    }}
                >
                    <MenuItem 
                        onClick={() => handleOpenDialog(editingItem!)}
                        sx={{
                            borderRadius: 2,
                            m: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            }
                        }}
                    >
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        แก้ไข
                    </MenuItem>
                    <MenuItem 
                        sx={{ 
                            color: 'error.main',
                            borderRadius: 2,
                            m: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            }
                        }}
                    >
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        ลบ
                    </MenuItem>
                </Menu>

                {/* Dialog */}
                {openDialog && (
                    <Dialog 
                        open={openDialog} 
                        onClose={handleCloseDialog} 
                        maxWidth="sm" 
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 4,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ 
                            background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                            color: 'white',
                            fontWeight: 700,
                            textAlign: 'center',
                            py: 2
                        }}>
                            {editingItem ? 'แก้ไขข้อมูลโรงเรือน' : 'เพิ่มโรงเรือนใหม่'}
                        </DialogTitle>
                        <DialogContent sx={{ p: 3 }}>
                            <Grid container spacing={2} sx={{ pt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField 
                                        label="ชื่อโรงเรือน" 
                                        defaultValue={editingItem?.name || ''} 
                                        fullWidth 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="ฟาร์ม" 
                                        defaultValue={editingItem?.farmId || ''} 
                                        fullWidth 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="ประเภท" 
                                        defaultValue={editingItem?.type || ''} 
                                        fullWidth 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        label="ความจุ" 
                                        type="number" 
                                        defaultValue={editingItem?.capacity || ''} 
                                        fullWidth 
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, gap: 2 }}>
                            <Button 
                                onClick={handleCloseDialog}
                                sx={{ 
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    px: 3
                                }}
                            >
                                ยกเลิก
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleCloseDialog}
                                sx={{ 
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                                    fontWeight: 600,
                                    px: 3,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #F57C00 0%, #FFB300 100%)',
                                        boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)',
                                    }
                                }}
                            >
                                บันทึก
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default HousesPage;