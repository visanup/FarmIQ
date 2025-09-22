import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button,
  Avatar,
  Badge,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications';
import { Alert } from '../../types/api';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch notifications and unread count
  const { data: notificationsData, isLoading, refresh } = useNotifications({ 
    limit: 10, 
    status: 'all' 
  });
  const { count: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  const handleRefresh = () => {
    refresh();
    setLastUpdate(new Date());
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      case 'medium':
        return <InfoIcon color="info" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  if (!open) return null;

  return (
    <Fade in={open} timeout={300}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          top: 60,
          right: 16,
          width: 400,
          maxHeight: 600,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1300,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              filter: 'blur(20px)',
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                <NotificationsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  การแจ้งเตือน
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {unreadCount > 0 ? `${unreadCount} รายการใหม่` : 'ไม่มีรายการใหม่'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="รีเฟรช">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="ปิด">
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        {unreadCount > 0 && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MarkReadIcon />}
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              อ่านทั้งหมด
            </Button>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                กำลังโหลด...
              </Typography>
            </Box>
          ) : notificationsData.notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'grey.100', 
                width: 64, 
                height: 64, 
                mx: 'auto', 
                mb: 2 
              }}>
                <NotificationsIcon sx={{ fontSize: 32, color: 'grey.400' }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                ไม่มีการแจ้งเตือน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีการแจ้งเตือนใหม่
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notificationsData.notifications.map((notification: Alert, index: number) => (
                <React.Fragment key={notification.id}>
                  <Zoom in timeout={300 + index * 100}>
                    <ListItem
                      sx={{
                        p: 2,
                        transition: 'all 0.3s ease',
                        backgroundColor: notification.acknowledged 
                          ? 'transparent' 
                          : alpha(theme.palette.primary.main, 0.05),
                        borderLeft: notification.acknowledged 
                          ? 'none' 
                          : `4px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette[getSeverityColor(notification.severity) as any].main, 0.1),
                            color: theme.palette[getSeverityColor(notification.severity) as any].main,
                          }}
                        >
                          {getSeverityIcon(notification.severity)}
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: notification.acknowledged ? 500 : 700,
                                color: notification.acknowledged ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.severity}
                              size="small"
                              color={getSeverityColor(notification.severity) as any}
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {!notification.acknowledged && (
                            <Tooltip title="อ่านแล้ว">
                              <IconButton
                                size="small"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markAsRead.isPending}
                                sx={{ color: 'primary.main' }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="ลบ">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(notification.id)}
                              disabled={deleteNotification.isPending}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Zoom>
                  
                  {index < notificationsData.notifications.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default NotificationPanel;
