import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, SvgIcon } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value?: number | string;
  unit?: string;
  icon?: React.ReactElement<SvgIconComponent>;
  color?: string;
  isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, icon, color = 'text.primary', isLoading }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" noWrap>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {icon && (
            <Box component="span" sx={{ mr: 1.5, color }}>
              {icon}
            </Box>
          )}
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, color }}>
              {value ?? '-'}
              {unit && value !== undefined && ` ${unit}`}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
