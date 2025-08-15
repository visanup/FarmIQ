// src/components/layout/Footer.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => (
  <Box component="footer" sx={{
    py: 2,
    px: 3,
    mt: 'auto',
    backgroundColor: (theme) => theme.palette.grey[200],
    textAlign: 'center',
  }}>
    <Typography variant="body2" color="textSecondary">
      © {new Date().getFullYear()} Betagro All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
