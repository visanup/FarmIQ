import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Avatar, Button, Divider, Fade, useTheme } from '@mui/material';
import { AccountCircle, Security, Notifications, Palette, Refresh, Payment } from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import PreferencesSettings from './components/PreferencesSettings';
import BillingSettings from './components/BillingSettings';

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const SettingsPage = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleRefresh = () => setLastUpdate(new Date());

  const tabsData = [
    { label: 'Profile', icon: <AccountCircle />, component: <ProfileSettings /> },
    { label: 'Security', icon: <Security />, component: <SecuritySettings /> },
    { label: 'Notifications', icon: <Notifications />, component: <NotificationSettings /> },
    { label: 'Preferences', icon: <Palette />, component: <PreferencesSettings /> },
    { label: 'Billing', icon: <Payment />, component: <BillingSettings /> },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3F51B5 0%, #7986CB 100%)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)', boxShadow: '0 4px 15px rgba(63,81,181,0.35)' }}>
                    <AccountCircle sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      การตั้งค่า
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>จัดการโปรไฟล์ ความปลอดภัย การแจ้งเตือน และการแสดงผล</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>อัปเดตล่าสุด: {lastUpdate.toLocaleString('th-TH')}</Typography>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>รีเฟรช</Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </Fade>

        {/* Content */}
        <Fade in timeout={1000}>
          <Box sx={{ p: 3 }}>
            <Card sx={{ display: 'flex', minHeight: '70vh', borderRadius: 4 }}>
              {/* Tabs */}
              <Box sx={{ width: 280, borderRight: `1px solid ${theme.palette.divider}`, background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}>
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={value}
                  onChange={handleChange}
                  aria-label="Vertical tabs"
                  sx={{
                    '& .MuiTab-root': {
                      justifyContent: 'flex-start',
                      minHeight: 60,
                      px: 2,
                      borderRadius: 2,
                      mx: 1,
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'rgba(63,81,181,0.08)',
                      color: 'primary.main',
                    },
                    '& .MuiTabs-indicator': {
                      left: 0,
                      width: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, #3F51B5 0%, #7986CB 100%)',
                    },
                  }}
                >
                  {tabsData.map((tab, index) => (
                    <Tab
                      key={tab.label}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                      {...a11yProps(index)}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Panel */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    {tabsData[value].component}
                  </CardContent>
                </Card>
              </Box>
            </Card>
          </Box>
        </Fade>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;