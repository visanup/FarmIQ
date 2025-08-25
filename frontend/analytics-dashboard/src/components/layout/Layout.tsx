import React, { useState, ReactNode } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Fab,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Devices as DevicesIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  LightMode,
  DarkMode,
  Agriculture as AgricultureIcon,
  Assessment as ReportsIcon,
  Visibility as MonitoringIcon,
  AttachMoney as EconomicsIcon,
  WbSunny as WeatherIcon,
  Inventory as FeedIcon,
  Science as FormulaIcon,
  Close as CloseIcon,
  Business as CustomerIcon,
  Payment as BillingIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;
const mobileDrawerWidth = 260;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'แดชบอร์ด',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    id: 'farms',
    label: 'จัดการฟาร์ม',
    icon: <AgricultureIcon />,
    path: '/farms',
  },
  {
    id: 'monitoring',
    label: 'ตรวจสอบ',
    icon: <MonitoringIcon />,
    path: '/monitoring',
  },
  {
    id: 'feed',
    label: 'จัดการอาหาร',
    icon: <FeedIcon />,
    path: '/feed',
  },
  {
    id: 'formula',
    label: 'สูตรอาหาร',
    icon: <FormulaIcon />,
    path: '/formula',
  },
  {
    id: 'analytics',
    label: 'การวิเคราะห์',
    icon: <AnalyticsIcon />,
    path: '/analytics',
  },
  {
    id: 'reports',
    label: 'รายงาน',
    icon: <ReportsIcon />,
    path: '/reports',
  },
  {
    id: 'economics',
    label: 'การเงิน',
    icon: <EconomicsIcon />,
    path: '/economics',
  },
  {
    id: 'weather',
    label: 'สภาพอากาศ',
    icon: <WeatherIcon />,
    path: '/weather',
  },
  {
    id: 'customers',
    label: 'จัดการลูกค้า',
    icon: <CustomerIcon />,
    path: '/customers',
  },
  {
    id: 'billing',
    label: 'การเงิน/บิลลิ่ง',
    icon: <BillingIcon />,
    path: '/billing',
  },
  {
    id: 'devices',
    label: 'อุปกรณ์',
    icon: <DevicesIcon />,
    path: '/devices',
  },
  {
    id: 'alerts',
    label: 'การแจ้งเตือน',
    icon: <NotificationsIcon />,
    path: '/alerts',
  },
  {
    id: 'settings',
    label: 'การตั้งค่า',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

interface LayoutProps {
  children?: ReactNode;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isDarkMode,
  onThemeToggle,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  const isMenuOpen = Boolean(anchorEl);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          <Box
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
            }}
          >
            🌱
          </Box>
          <Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                color: theme.palette.text.primary,
              }}
            >
              FarmIQ
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                fontWeight: 500,
              }}
            >
              Analytics
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ opacity: theme.palette.mode === 'dark' ? 0.15 : 0.1 }} />
      <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, overflow: 'auto' }}>
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: { xs: 1, sm: 1.2 },
                    px: { xs: 1.5, sm: 2 },
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.contrastText,
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'inherit' : theme.palette.text.secondary,
                      minWidth: { xs: 32, sm: 36 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuClose}>
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        โปรไฟล์
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleProfileMenuClose}>
        <ListItemIcon>
          {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </ListItemIcon>
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={onThemeToggle}
              size="small"
            />
          }
          label={isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด'}
          sx={{ margin: 0 }}
        />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        ออกจากระบบ
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          backdropFilter: 'blur(20px)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {navigationItems.find(item => 
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            )?.label || 'แดชบอร์ด'}
          </Typography>

          {/* Theme Toggle Button */}
          <Tooltip title={isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด'}>
            <IconButton
              onClick={onThemeToggle}
              sx={{
                mr: 1,
                color: theme.palette.text.primary,
                borderRadius: 2,
                padding: { xs: 1, sm: 1.5 },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isDarkMode ? 
                <LightMode sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} /> : 
                <DarkMode sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
              }
            </IconButton>
          </Tooltip>

          {/* Profile Button */}
          <Tooltip title="โปรไฟล์">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                color: theme.palette.text.primary,
                borderRadius: 2,
                padding: { xs: 1, sm: 1.5 },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <AccountCircle sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: mobileDrawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: 'none',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: 'none',
              boxShadow: theme.shadows[2],
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }} />
        {children || <Outlet />}
        
        {/* Floating Theme Toggle for Mobile */}
        {isMobile && (
          <Zoom in={true}>
            <Fab
              color="primary"
              size="medium"
              onClick={onThemeToggle}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: theme.zIndex.speedDial,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: theme.shadows[8],
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: theme.shadows[12],
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </Fab>
          </Zoom>
        )}
      </Box>
      {profileMenu}
    </Box>
  );
};

export default Layout;