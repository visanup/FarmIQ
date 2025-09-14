import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface AlertsPanelProps {
  alerts: any[];
  isRealTimeEnabled: boolean;
  refreshInterval: number;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  isRealTimeEnabled,
  refreshInterval,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              การแจ้งเตือนล่าสุด
            </Typography>
            <List>
              {alerts.length > 0 ? alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: alert.type === 'error' ? 'error.main' : 
                                  alert.type === 'warning' ? 'warning.main' : 'info.main',
                          width: 32,
                          height: 32
                        }}
                      >
                        {alert.type === 'error' ? <ErrorIcon /> : 
                         alert.type === 'warning' ? <WarningIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="600">
                          {alert.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString('th-TH')}
                        </Typography>
                      }
                    />
                    <Chip
                      label={alert.type === 'error' ? 'ผิดปกติ' : 
                            alert.type === 'warning' ? 'เตือน' : 'ปกติ'}
                      color={alert.type === 'error' ? 'error' : 
                            alert.type === 'warning' ? 'warning' : 'info'}
                      size="small"
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <ListItem>
                  <ListItemText
                    primary="ไม่มีการแจ้งเตือน"
                    secondary="ระบบทำงานปกติ"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              สถานะระบบ
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">สถานะการเชื่อมต่อ</Typography>
                <Chip label="ออนไลน์" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">ความถี่การอัปเดต</Typography>
                <Typography variant="body2" fontWeight="600">
                  {refreshInterval} วินาที
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">ข้อมูลล่าสุด</Typography>
                <Typography variant="body2" fontWeight="600">
                  {new Date().toLocaleTimeString('th-TH')}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

