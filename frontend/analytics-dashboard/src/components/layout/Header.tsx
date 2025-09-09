import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';

interface HeaderProps {
  onMenuClick: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onRefresh }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const { isRealTimeEnabled, setRealTimeEnabled, lastUpdate } = useDashboardStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
    handleProfileMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleProfileMenuClose();
  };

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เพิ่งอัปเดต';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} วันที่แล้ว`;
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#1A1A1A',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Left side - Menu button and logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ 
              mr: 2,
              display: { md: 'none' },
              color: 'primary.main',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                F
              </Typography>
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              FarmIQ Analytics
            </Typography>
          </Box>
        </Box>

        {/* Center - Page title (hidden on mobile) */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              ระบบจัดการฟาร์มอัจฉริยะ
            </Typography>
          </Box>
        )}

        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Real-time status */}
          <Chip
            label={`อัปเดตล่าสุด: ${formatLastUpdate(lastUpdate)}`}
            size="small"
            color={isRealTimeEnabled ? 'success' : 'default'}
            variant="outlined"
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              fontSize: '0.75rem',
            }}
          />

          {/* Refresh button */}
          <IconButton
            color="primary"
            onClick={onRefresh}
            sx={{ 
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.12)',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ color: 'text.secondary' }}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
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
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {user?.name || 'Demo User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email || 'demo@farmiq.com'}
            </Typography>
          </Box>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
            การตั้งค่า
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            ออกจากระบบ
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 300,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              การแจ้งเตือน
            </Typography>
          </Box>
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                อุณหภูมิสูงเกินไป
              </Typography>
              <Typography variant="caption" color="text.secondary">
                5 นาทีที่แล้ว
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                อุปกรณ์ออฟไลน์
              </Typography>
              <Typography variant="caption" color="text.secondary">
                15 นาทีที่แล้ว
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                การแจ้งเตือนใหม่
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 ชั่วโมงที่แล้ว
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
