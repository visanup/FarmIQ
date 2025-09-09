import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';

interface AIInsight {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  confidence: number;
  impact: string;
}

interface AIInsightsProps {
  insights: AIInsight[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {insights.map((insight) => (
        <Grid item xs={12} sm={6} md={3} key={insight.id}>
          <Card 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${
                insight.type === 'success' ? '#e8f5e8' : 
                insight.type === 'info' ? '#e3f2fd' : 
                insight.type === 'warning' ? '#fff3e0' : '#ffebee'
              }, #ffffff)`,
              border: `1px solid ${
                insight.type === 'success' ? '#c8e6c9' : 
                insight.type === 'info' ? '#bbdefb' : 
                insight.type === 'warning' ? '#ffe0b2' : '#ffcdd2'
              }`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: insight.type === 'success' ? 'success.main' : 
                            insight.type === 'info' ? 'info.main' : 
                            insight.type === 'warning' ? 'warning.main' : 'error.main',
                    mr: 2
                  }}
                >
                  {insight.type === 'success' ? <CheckCircleIcon /> : 
                   insight.type === 'info' ? <AIIcon /> : 
                   insight.type === 'warning' ? <WarningIcon /> : <ErrorIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ความเชื่อมั่น: {insight.confidence}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {insight.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={`ผลกระทบ: ${insight.impact}`}
                  color={insight.type as any}
                  size="small"
                />
                <LinearProgress
                  variant="determinate"
                  value={insight.confidence}
                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

