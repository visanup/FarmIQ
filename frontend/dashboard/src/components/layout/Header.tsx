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
  Tooltip,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { 
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUnreadCount } from '../../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { count: unreadCount } = useUnreadCount();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
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

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleMode}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="การแจ้งเตือน">
                <IconButton onClick={handleNotificationClick}>
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          height: 18,
                          minWidth: 18,
                          fontWeight: 700,
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
                <IconButton onClick={handleProfileMenuOpen} size="small">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                </IconButton>
            </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ 
            sx: { 
              mt: 1.5, 
              minWidth: 220,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
            } 
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'fontWeightBold' }}>
              {user?.name || 'Demo User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'demo@farmiq.com'}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleSettings} sx={{ mx: 1 }}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ mx: 1, color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Notification Panel */}
        <NotificationPanel 
          open={notificationOpen} 
          onClose={() => setNotificationOpen(false)} 
        />
      </Toolbar>
    </AppBar>
  );
};
