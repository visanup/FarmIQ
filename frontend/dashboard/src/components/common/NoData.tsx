import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

interface NoDataProps {
  message?: string;
}

const NoData: React.FC<NoDataProps> = ({ message = 'No data available' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <InfoIcon sx={{ fontSize: 48, mb: 1, color: 'grey.400' }} />
      <Typography variant="h6" component="p" sx={{ mb: 0.5 }}>
        No Results
      </Typography>
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};

export default NoData;
