import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Agriculture as FarmIcon,
  MonitorHeart as MonitoringIcon,
  Assessment as AnalyticsIcon,
  Sensors as SensorIcon,
  Psychology as PerformanceIcon,
  Devices as DeviceIcon,
  Group as CustomerIcon,
  Settings as SettingsIcon,
  CloudQueue as WeatherIcon,
  Restaurant as FeedIcon,
  Science as FormulaIcon,
  Payment as BillingIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardStore } from '../../stores/dashboardStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', badge: null },
  { text: 'Farms', icon: <FarmIcon />, path: '/farms', badge: null },
  { text: 'Monitoring', icon: <MonitoringIcon />, path: '/monitoring', badge: 'Live' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', badge: null },
  { text: 'Real-time', icon: <SensorIcon />, path: '/realtime', badge: 'New' },
  { text: 'AI Analytics', icon: <PerformanceIcon />, path: '/ai-analytics', badge: 'AI' },
  { text: 'Devices', icon: <DeviceIcon />, path: '/devices', badge: null },
  { text: 'Customers', icon: <CustomerIcon />, path: '/customers', badge: null },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', badge: null },
];

const quickActions = [
  { text: 'Weather', icon: <WeatherIcon />, path: '/weather' },
  { text: 'Feed Management', icon: <FeedIcon />, path: '/feed' },
  { text: 'Formula Management', icon: <FormulaIcon />, path: '/formula' },
  { text: 'Billing', icon: <BillingIcon />, path: '/billing' },
  { text: 'Reports', icon: <TimelineIcon />, path: '/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isRealTimeEnabled, setRealTimeEnabled } = useDashboardStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            FarmIQ
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Analytics Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Real-time Status */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isRealTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Real-time Updates
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isRealTimeEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
            </Box>
          }
          sx={{ m: 0 }}
        />
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive ? 'rgba(46, 125, 50, 0.12)' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? 'rgba(46, 125, 50, 0.16)' 
                        : 'rgba(46, 125, 50, 0.08)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.main' : 'text.secondary',
                      minWidth: 40,
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color={item.badge === 'AI' ? 'primary' : item.badge === 'Live' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.625rem',
                        height: 20,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Quick Actions */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
            Quick Actions
          </Typography>
        </Box>
        <List sx={{ px: 1, py: 0 }}>
          {quickActions.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={item.text} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    py: 1,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.08)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiListItemIcon-root': {
                      color: 'text.secondary',
                      minWidth: 40,
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 500,
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          FarmIQ Analytics v2.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 All rights reserved
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobile && open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: theme.zIndex.drawer,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
