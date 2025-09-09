import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { useDashboardStore } from '../../stores/dashboardStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { refreshData } = useDashboardStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar */}
      <Sidebar 
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />

      {/* Header */}
      <Header 
        onMenuClick={handleDrawerToggle}
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <MainContent>
        {children}
      </MainContent>
    </Box>
  );
};