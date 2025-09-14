import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Grid, Paper } from '@mui/material';
import { AccountCircle, Security, Notifications, Palette } from '@mui/icons-material';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import PreferencesSettings from './components/PreferencesSettings';

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const SettingsPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabsData = [
    { label: 'Profile', icon: <AccountCircle />, component: <ProfileSettings /> },
    { label: 'Security', icon: <Security />, component: <SecuritySettings /> },
    { label: 'Notifications', icon: <Notifications />, component: <NotificationSettings /> },
    { label: 'Preferences', icon: <Palette />, component: <PreferencesSettings /> },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'fontWeightBold' }}>
          Settings
        </Typography>
        <Paper sx={{ display: 'flex', minHeight: '70vh' }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
            >
              {tabsData.map((tab, index) => (
                <Tab 
                  key={tab.label}
                  label={tab.label} 
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ justifyContent: 'flex-start', minHeight: 60 }}
                  {...a11yProps(index)} 
                />
              ))}
            </Tabs>
            <Box sx={{ p: 3, flexGrow: 1 }}>
              {tabsData[value].component}
            </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;