import React, { useState, useEffect, SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddBoxIcon from '@mui/icons-material/AddBox';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TimelineIcon from '@mui/icons-material/Timeline';

import DeviceList from './DeviceList';
import DeviceForm from './DeviceForm';
import DeviceGroups from './DeviceGroups';
import DeviceTypes from './DeviceTypes';
import DeviceLogs from './DeviceLogs';
import DeviceStatusHistory from './DeviceStatusHistory';

const tabConfig = [
  { label: 'Devices List', Component: DeviceList, icon: <FormatListBulletedIcon /> },
  { label: 'Create Device', Component: DeviceForm, icon: <AddBoxIcon /> },
  { label: 'Devices Groups', Component: DeviceGroups, icon: <GroupIcon /> },
  { label: 'Devices Types', Component: DeviceTypes, icon: <CategoryIcon /> },
  { label: 'Devices Logs', Component: DeviceLogs, icon: <ReceiptLongIcon /> },
  { label: 'Devices History', Component: DeviceStatusHistory, icon: <TimelineIcon /> },
] as const;

type TabConfig = typeof tabConfig[number];

const DevicePage: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = Number(searchParams.get('tab') ?? 0);
  const [activeTab, setActiveTab] = useState<number>(initialTab);

  // update URL on tab change
  useEffect(() => {
    setSearchParams({ tab: String(activeTab) });
  }, [activeTab, setSearchParams]);

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const CurrentComponent = tabConfig[activeTab]?.Component || (() => <Typography>Tab not found</Typography>);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', mt: theme.spacing(8), px: theme.spacing(2) }}>
        {/* Header */}
                {/* Page Title */}
        <Box display="flex" alignItems="center" mb={2}>
          {tabConfig[activeTab].icon}
          <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
            {tabConfig[activeTab].label}
          </Typography>
        </Box>

        {/* Tab Navigation */}
        <Paper elevation={1} sx={{ mb: theme.spacing(3) }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Device management tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabConfig.map(({ label, icon }, idx) => (
              <Tab
                key={label}
                icon={icon}
                iconPosition="start"
                label={label}
                aria-controls={`device-tabpanel-${idx}`}
                id={`device-tab-${idx}`}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Content */}
        <Box
          role="tabpanel"
          id={`device-tabpanel-${activeTab}`}
          aria-labelledby={`device-tab-${activeTab}`}
          sx={{ p: theme.spacing(2) }}
        >
          <CurrentComponent />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DevicePage;
