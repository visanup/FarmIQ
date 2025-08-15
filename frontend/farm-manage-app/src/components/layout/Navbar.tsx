// frontend\farm-manage-app\src\components\layout\Navbar.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_DATA_SERVICE_URL ?? ''; // ถ้าใช้ Vite
// หรือใช้ process.env.REACT_APP_DATA_SERVICE_URL ถ้าใช้ CRA

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface AlertRecord {
  id: number;
  read?: boolean;
}

type NavbarProps = {
  open: boolean;
  onMenuClick: () => void;
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ open, onMenuClick, isAuthenticated, userName, onLogout }) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const navigate = useNavigate();

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data: AlertRecord[] = await res.json();
      const unread = data.filter((a) => !a.read).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  const handleProfileMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    onLogout();
    navigate('/login');
  };
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar
      position="fixed"
      elevation={6}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundImage: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
        boxShadow: '0 4px 12px rgb(33 203 243 / 0.5)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && isSmUp && {
          marginLeft: 240,
          width: `calc(100% - 240px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
      }}
    >
      <Toolbar>
        {!open && (
          <Tooltip title="Open menu">
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              aria-label="open drawer"
              size="large"
              sx={{
                mr: 2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.35)' },
              }}
            >
              <MenuIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        )}
        <Typography
          variant="h6"
          noWrap
          sx={{ flexGrow: 1, userSelect: 'none', fontWeight: 600, letterSpacing: 1 }}
        >
          Device Management
        </Typography>

        <Tooltip title={`${notificationCount} new notifications`}>
          <IconButton
            color="inherit"
            sx={{ mr: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
            aria-label="show notifications"
            size="large"
            onClick={fetchNotificationCount} // หรือเปิดเมนูแจ้งเตือนในอนาคต
          >
            <Badge badgeContent={notificationCount} color="error" overlap="circular">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {isAuthenticated ? (
          <>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {userName ? (
                <Avatar alt={userName}>{userName.charAt(0).toUpperCase()}</Avatar>
              ) : (
                <Avatar src="/static/avatar.png" />
              )}
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', mr: 1 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/signup')}
              sx={{ textTransform: 'none' }}
            >
              Signup
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
