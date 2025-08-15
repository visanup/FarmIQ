// frontend\farm-manage-app\src\components\layout\Layout.tsx
import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

type LayoutProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
};

const Layout: React.FC<LayoutProps> = ({ isAuthenticated, onLogout }) => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const [open, setOpen] = React.useState(isSmUp);

  const toggleDrawer = () => setOpen(prev => !prev);

  // MUI Toolbar minHeight accounts for AppBar height
  const appBarHeight = theme.mixins.toolbar.minHeight as number;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar fixed at top */}
      <Navbar
        open={open}
        onMenuClick={toggleDrawer}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />

      {/* Sidebar and main content */}
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <Sidebar open={open} onClose={toggleDrawer} />

        {/* Main content: offset below AppBar */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: `${appBarHeight}px`, // push below fixed AppBar
            height: `calc(100vh - ${appBarHeight}px)`, // full viewport minus AppBar
            overflow: 'auto', // scroll if content overflows
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Footer at bottom */}
      <Footer />
    </Box>
  );
};

export default Layout;




