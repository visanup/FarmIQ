import { Card, CardContent, Typography, CardProps, Box } from '@mui/material';
import React from 'react';

interface ChartCardProps extends CardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, ...props }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column', ...props.sx }} {...props}>
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', flexGrow: 1, '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } } }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};
