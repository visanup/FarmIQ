import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3 },
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
        mt: '64px', // Height of AppBar
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#F8F9FA',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(46, 125, 50, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(139, 195, 74, 0.03) 0%, transparent 50%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          maxWidth: '100%',
          mx: 'auto',
          '& > *': {
            mb: 3,
            '&:last-child': {
              mb: 0,
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
