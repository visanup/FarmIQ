import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  useTheme,
  Chip,
  ListSubheader,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Agriculture as FarmIcon,
  MonitorHeart as MonitoringIcon,
  Assessment as AnalyticsIcon,
  Sensors as SensorIcon,
  Psychology as AiIcon,
  Devices as DeviceIcon,
  Group as CustomerIcon,
  Settings as SettingsIcon,
  Timeline as ReportsIcon,
  Dns as MasterDataIcon,
  ExpandLess,
  ExpandMore,
  Category as AnimalTypeIcon,
  Pets as BreedIcon,
  DevicesOther as DeviceTypeIcon,
  Science as FormulaIcon,
  Fastfood as FeedIcon,
  Place as ZoneIcon,
  Router as StationIcon,
  House as HouseIcon,
  Groups as FlockIcon,
  Api as ExternalDataIcon,
  SettingsApplications as SystemConfigIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Collapse } from '@mui/material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

const mainNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Monitoring', icon: <MonitoringIcon />, path: '/monitoring' },
    { text: 'Real-time', icon: <SensorIcon />, path: '/realtime', badge: 'Live' },
];

const analysisNavItems = [
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'AI Analytics', icon: <AiIcon />, path: '/ai-analytics', badge: 'New' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
];

const farmManagementItems = [
    { text: 'Farms', icon: <FarmIcon />, path: '/farms' },
    { text: 'Houses', icon: <HouseIcon />, path: '/houses' },
    { text: 'Zones', icon: <ZoneIcon />, path: '/zones' },
    { text: 'Stations', icon: <StationIcon />, path: '/stations' },
    { text: 'Flocks', icon: <FlockIcon />, path: '/flocks' },
];

const animalDataItems = [
    { text: 'Animal Types', icon: <AnimalTypeIcon />, path: '/animal-types' },
    { text: 'Breeds', icon: <BreedIcon />, path: '/breeds' },
];

const deviceSensorItems = [
    { text: 'Devices', icon: <DeviceIcon />, path: '/devices' },
    { text: 'Device Types', icon: <DeviceTypeIcon />, path: '/device-types' },
    { text: 'Sensor Types', icon: <SensorIcon />, path: '/sensor-types' },
];

const systemConfigItems = [
    { text: 'Customers', icon: <CustomerIcon />, path: '/customers' },
    { text: 'Feed Types', icon: <FeedIcon />, path: '/feed-types' },
    { text: 'Formulas', icon: <FormulaIcon />, path: '/formulas' },
    { text: 'External Sources', icon: <ExternalDataIcon />, path: '/external-data-sources' },
];

const settingsNavItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const NavList: React.FC<{ items: any[], handleNavigation: (path: string) => void, location: any, sx?: object }> = ({ items, handleNavigation, location, sx }) => (
    <List component="div" disablePadding sx={sx}>
        {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
                <ListItemButton
                    key={item.text}
                    selected={isActive}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                        py: 1,
                        px: 2.5,
                        '&.Mui-selected': {
                            backgroundColor: 'action.selected',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            }
                        },
                        '& .MuiListItemIcon-root': {
                            minWidth: '40px',
                            color: isActive ? 'primary.main' : 'text.secondary',
                        },
                        '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 'fontWeightMedium' : 'fontWeightRegular',
                        },
                    }}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.badge && (
                        <Chip
                            label={item.badge}
                            size="small"
                            color={item.badge === 'Live' ? 'success' : 'secondary'}
                            sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                    )}
                </ListItemButton>
            );
        })}
    </List>
);

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [managementOpen, setManagementOpen] = React.useState(true);
  const [farmManagementOpen, setFarmManagementOpen] = React.useState(true);
  const [animalDataOpen, setAnimalDataOpen] = React.useState(false);
  const [systemConfigOpen, setSystemConfigOpen] = React.useState(false);
  const [deviceSensorOpen, setDeviceSensorOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close drawer on mobile after navigation
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, height: '64px' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            F
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          FarmIQ
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'neutral.light' }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <List
            component="nav"
            subheader={
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', textTransform: 'uppercase', fontWeight: 'fontWeightBold', fontSize: '0.75rem', lineHeight: 'inherit', mb: 1 }}>
                    Main
                </ListSubheader>
            }
        >
            <NavList items={mainNavItems} handleNavigation={handleNavigation} location={location} />
        </List>
        <List
            component="nav"
            subheader={
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', textTransform: 'uppercase', fontWeight: 'fontWeightBold', fontSize: '0.75rem', lineHeight: 'inherit', my: 1 }}>
                    Analysis
                </ListSubheader>
            }
        >
            <NavList items={analysisNavItems} handleNavigation={handleNavigation} location={location} />
        </List>
        
        {/* Management Collapsible Menu */}
        <List
            component="nav"
            subheader={
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', textTransform: 'uppercase', fontWeight: 'fontWeightBold', fontSize: '0.75rem', lineHeight: 'inherit', my: 1 }}>
                    Management
                </ListSubheader>
            }
        >
            <ListItemButton onClick={() => setManagementOpen(!managementOpen)} sx={{ borderRadius: 0 }}>
                <ListItemIcon sx={{ minWidth: '40px' }}>
                    <MasterDataIcon />
                </ListItemIcon>
                <ListItemText primary="Master Data" />
                {managementOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={managementOpen} timeout="auto" unmountOnExit>
                
                {/* Farm & Livestock collapsible */}
                <ListItemButton onClick={() => setFarmManagementOpen(!farmManagementOpen)} sx={{ borderRadius: 0, pl: 4 }}>
                    <ListItemIcon sx={{ minWidth: '40px' }}><FarmIcon /></ListItemIcon>
                    <ListItemText primary="Farm & Livestock" />
                    {farmManagementOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={farmManagementOpen} timeout="auto" unmountOnExit>
                    <NavList items={farmManagementItems} handleNavigation={handleNavigation} location={location} sx={{ pl: 4 }} />
                </Collapse>

                {/* Animal Data collapsible */}
                <ListItemButton onClick={() => setAnimalDataOpen(!animalDataOpen)} sx={{ borderRadius: 0, pl: 4 }}>
                    <ListItemIcon sx={{ minWidth: '40px' }}><PetsIcon /></ListItemIcon>
                    <ListItemText primary="Animal Data" />
                    {animalDataOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={animalDataOpen} timeout="auto" unmountOnExit>
                    <NavList items={animalDataItems} handleNavigation={handleNavigation} location={location} sx={{ pl: 4 }} />
                </Collapse>

                {/* Device & Sensor collapsible */}
                <ListItemButton onClick={() => setDeviceSensorOpen(!deviceSensorOpen)} sx={{ borderRadius: 0, pl: 4 }}>
                    <ListItemIcon sx={{ minWidth: '40px' }}><SensorIcon /></ListItemIcon>
                    <ListItemText primary="Device & Sensor" />
                    {deviceSensorOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={deviceSensorOpen} timeout="auto" unmountOnExit>
                    <NavList items={deviceSensorItems} handleNavigation={handleNavigation} location={location} sx={{ pl: 4 }} />
                </Collapse>

                {/* System & Config collapsible */}
                <ListItemButton onClick={() => setSystemConfigOpen(!systemConfigOpen)} sx={{ borderRadius: 0, pl: 4 }}>
                    <ListItemIcon sx={{ minWidth: '40px' }}><SystemConfigIcon /></ListItemIcon>
                    <ListItemText primary="System & Config" />
                    {systemConfigOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={systemConfigOpen} timeout="auto" unmountOnExit>
                    <NavList items={systemConfigItems} handleNavigation={handleNavigation} location={location} sx={{ pl: 4 }} />
                </Collapse>

            </Collapse>
        </List>
        
        <List
            component="nav"
            subheader={
                <ListSubheader component="div" sx={{ bgcolor: 'transparent', textTransform: 'uppercase', fontWeight: 'fontWeightBold', fontSize: '0.75rem', lineHeight: 'inherit', my: 1 }}>
                    Settings
                </ListSubheader>
            }
        >
            <NavList items={settingsNavItems} handleNavigation={handleNavigation} location={location} />
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" display="block">
          © 2024 FarmIQ Analytics
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
        {/* Mobile Drawer */}
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
        >
            {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
            variant="permanent"
            sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { 
                    boxSizing: 'border-box', 
                    width: drawerWidth,
                    borderRight: 'none', // Force remove border
                    backgroundColor: 'background.paper'
                },
            }}
            open
        >
            {drawerContent}
        </Drawer>
    </Box>
  );
};
