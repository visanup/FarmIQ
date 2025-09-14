import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={handleDrawerToggle}
      />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: `${64}px`, // Standard AppBar height
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};