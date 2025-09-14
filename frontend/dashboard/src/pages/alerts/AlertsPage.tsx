import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Fab,
  Zoom,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import CustomerAwarePageHeader from '../../components/common/CustomerAwarePageHeader';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  customerId: number; // Add customer ID for filtering
  title: string;
  message: string;
  timestamp: string;
  farm: string;
  device?: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'error',
    customerId: 1,
    title: 'เซ็นเซอร์อุณหภูมิขัดข้อง',
    message: 'เซ็นเซอร์อุณหภูมิในโรงเรือนที่ 1 ไม่ตอบสนอง',
    timestamp: '2024-01-15T10:30:00Z',
    farm: 'ฟาร์มเกษตรอินทรีย์',
    device: 'TEMP-001',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'warning',
    customerId: 1,
    title: 'ระดับน้ำต่ำ',
    message: 'ระดับน้ำในถังเก็บน้ำลดลงต่ำกว่าเกณฑ์',
    timestamp: '2024-01-15T09:15:00Z',
    farm: 'ฟาร์มเกษตรอินทรีย์',
    device: 'WATER-002',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'info',
    customerId: 1,
    title: 'การรดน้ำอัตโนมัติเสร็จสิ้น',
    message: 'ระบบรดน้ำอัตโนมัติในแปลงที่ 3 ทำงานเสร็จสิ้น',
    timestamp: '2024-01-15T08:00:00Z',
    farm: 'ฟาร์มผักปลอดสาร',
    isRead: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'warning',
    customerId: 2,
    title: 'อุณหภูมิสูงผิดปกติ',
    message: 'อุณหภูมิในบ่อเลี้ยงสูงเกิน 35°C',
    timestamp: '2024-01-15T07:45:00Z',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
    device: 'TEMP-002',
    isRead: false,
    priority: 'high'
  },
  {
    id: '5',
    type: 'success',
    customerId: 2,
    title: 'ระบบบำรุงรักษาเสร็จสิ้น',
    message: 'การบำรุงรักษาเซ็นเซอร์ทำงานเสร็จสิ้น',
    timestamp: '2024-01-15T06:30:00Z',
    farm: 'ฟาร์มไฮโดรโปนิกส์',
    isRead: true,
    priority: 'low'
  },
];

const AlertsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state } = useDashboard();
  
  const [currentTab, setCurrentTab] = useState(0);
  
  // Customer filtering for alerts
  const [allAlerts] = useState<Alert[]>(mockAlerts);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Filter alerts based on customer context
  useEffect(() => {
    if (state.isAdmin) {
      // Admin can see all alerts
      setAlerts(allAlerts);
    } else if (state.currentCustomer) {
      // Regular customer sees only their alerts
      const customerAlerts = allAlerts.filter(alert => alert.customerId === state.currentCustomer?.id);
      setAlerts(customerAlerts);
    } else {
      // No access
      setAlerts([]);
    }
  }, [state.currentCustomer, state.isAdmin, allAlerts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      case 'success': return <SuccessIcon />;
      default: return <InfoIcon />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'success': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const filteredAlerts = currentTab === 0 ? alerts : alerts.filter(alert => !alert.isRead);

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <CustomerAwarePageHeader
        title="🔔 การแจ้งเตือนระบบ"
        subtitle="ติดตามและจัดการการแจ้งเตือนจากเซ็นเซอร์และอุปกรณ์ต่างๆ ในฟาร์ม"
        actionButton={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Button
                variant="outlined"
                startIcon={<MarkReadIcon />}
                sx={{ borderRadius: 2 }}
              >
                อ่านทั้งหมด
              </Button>
            </Badge>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{ borderRadius: 2 }}
            >
              กรอง
            </Button>
          </Box>
        }
        noDataMessage={alerts.length === 0 ? "ไม่พบการแจ้งเตือนสำหรับลูกค้ารายนี้" : undefined}
      />

      {/* Return early if no access */}
      {!state.currentCustomer && !state.isAdmin && (
        <Box sx={{ mt: 3 }}>
          {/* This will be handled by CustomerAwarePageHeader */}
        </Box>
      )}

      {/* Summary Cards */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 }
        }}
      >
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
            <Avatar sx={{ bgcolor: theme.palette.error.main + '15', color: theme.palette.error.main, mx: 'auto', mb: 1 }}>
              <ErrorIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {alerts.filter(a => a.type === 'error').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ข้อผิดพลาด
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ textAlign: 'center', p: 2 }}>
          <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
            <Avatar sx={{ bgcolor: theme.palette.warning.main + '15', color: theme.palette.warning.main, mx: 'auto', mb: 1 }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {alerts.filter(a => a.type === 'warning').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คำเตือน
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ textAlign: 'center', p: 2 }}>
          <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
            <Avatar sx={{ bgcolor: theme.palette.info.main + '15', color: theme.palette.info.main, mx: 'auto', mb: 1 }}>
              <InfoIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {alerts.filter(a => a.type === 'info').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ข้อมูล
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ textAlign: 'center', p: 2 }}>
          <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main + '15', color: theme.palette.primary.main, mx: 'auto', mb: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {unreadCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ยังไม่อ่าน
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Alerts List */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label="การแจ้งเตือนทั้งหมด" />
            <Tab label={`ยังไม่อ่าน (${unreadCount})`} />
          </Tabs>
        </Box>

        <List sx={{ p: 0 }}>
          {filteredAlerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                borderLeft: `4px solid ${getAlertColor(alert.type)}`,
                bgcolor: !alert.isRead ? `${getAlertColor(alert.type)}08` : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.02)' 
                    : 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: getAlertColor(alert.type) + '15',
                    color: getAlertColor(alert.type),
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}
                >
                  {getAlertIcon(alert.type)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: !alert.isRead ? 600 : 400,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {alert.title}
                    </Typography>
                    <Chip
                      label={alert.priority}
                      size="small"
                      color={alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {!alert.isRead && (
                      <Chip
                        label="ใหม่"
                        size="small"
                        color="primary"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {alert.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        🏠 {alert.farm}
                      </Typography>
                      {alert.device && (
                        <Typography variant="caption" color="text.secondary">
                          📱 {alert.device}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        🕒 {new Date(alert.timestamp).toLocaleString('th-TH')}
                      </Typography>
                    </Box>
                  </Stack>
                }
              />
              
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  {!alert.isRead && (
                    <Tooltip title="ทำเครื่องหมายว่าอ่านแล้ว">
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(alert.id)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <MarkReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="ลบ">
                    <IconButton
                      size="small"
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Floating Action Button */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: theme.zIndex.speedDial - 1
            }}
          >
            <FilterIcon />
          </Fab>
        </Zoom>
      )}
    </Container>
  );
};

export default AlertsPage;