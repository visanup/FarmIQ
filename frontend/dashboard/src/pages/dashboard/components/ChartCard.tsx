import React from 'react';
import { Card, CardHeader, CardContent, IconButton, Box, Typography, useTheme, Skeleton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface ChartCardProps {
  title: string;
  subheader?: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: string | number;
  dense?: boolean; // tighter header/content paddings for more chart room
  contentPadding?: number; // override content padding (px)
  variant?: 'glass' | 'solid';
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subheader, children, loading, height = 380, dense = true, contentPadding, variant = 'glass' }) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        border: `1px solid ${theme.palette.divider}`,
        background: variant === 'glass'
          ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)'} 100%)`
          : theme.palette.background.paper,
        '&:hover': {
          boxShadow: '0 14px 46px rgba(0,0,0,0.10)',
        },
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <CardHeader
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={subheader}
        sx={{
          pb: dense ? 0.5 : 1.5,
          px: dense ? 2 : 3,
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: contentPadding !== undefined ? contentPadding : (dense ? 2 : 3), pt: dense ? 1 : 2 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={height} sx={{ borderRadius: 2, mt: 1 }} />
        ) : (
          <Box sx={{ height, mx: dense ? -0.5 : 0 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
