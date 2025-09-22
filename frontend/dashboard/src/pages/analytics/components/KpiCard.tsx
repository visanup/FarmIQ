import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Avatar,
  alpha,
  Fade,
  Zoom,
  LinearProgress
} from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface KpiCardProps {
  title: string;
  value?: number | string;
  unit?: string;
  icon?: React.ReactElement<SvgIconComponent>;
  color?: string;
  isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color = '#4CAF50', 
  isLoading 
}) => {
  return (
    <Fade in timeout={600}>
      <Card sx={{ 
        height: '100%', 
        borderRadius: 3, 
        border: `1px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${alpha(color, 0.3)}`,
          borderColor: color,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" sx={{ 
              fontWeight: 600, 
              color: 'text.secondary',
              fontSize: '0.9rem'
            }}>
              {title}
            </Typography>
            {icon && (
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: color,
                boxShadow: `0 4px 12px ${alpha(color, 0.4)}`
              }}>
                {icon}
              </Avatar>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 48 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <LinearProgress 
                  sx={{ 
                    flex: 1, 
                    height: 8, 
                    borderRadius: 4,
                    background: alpha(color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                      borderRadius: 4
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 'fit-content' }}>
                  Loading...
                </Typography>
              </Box>
            ) : (
              <Zoom in timeout={800}>
                <Box>
                  <Typography variant="h3" component="div" sx={{ 
                    fontWeight: 800, 
                    color: color,
                    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0 2px 4px ${alpha(color, 0.3)}`,
                    mb: 0.5
                  }}>
                    {value ?? '-'}
                  </Typography>
                  {unit && value !== undefined && (
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}>
                      {unit}
                    </Typography>
                  )}
                </Box>
              </Zoom>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};
