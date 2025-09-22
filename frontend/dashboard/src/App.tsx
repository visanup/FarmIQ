import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { modernTheme } from './theme/modernTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Import pages
import DashboardPage from './pages/dashboard/DashboardPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import FarmsPage from './pages/farms/FarmsPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DevicesPage from './pages/devices/DevicesPage';
import CustomersPage from './pages/customers/CustomersPage';
import RealtimePage from './pages/realtime/RealtimePage';
import AIAnalyticsPage from './pages/ai/AIAnalyticsPage';
import AnimalTypesPage from './pages/animal-types/AnimalTypesPage';
import BreedsPage from './pages/breeds/BreedsPage';
import DeviceTypesPage from './pages/device-types/DeviceTypesPage';
import SensorTypesPage from './pages/sensor-types/SensorTypesPage';
import ZonesPage from './pages/zones/ZonesPage';
import StationsPage from './pages/stations/StationsPage';
import FeedTypesPage from './pages/feed-types/FeedTypesPage';
import FormulaManagementPage from './pages/formula/FormulaManagementPage';
import HousesPage from './pages/houses/HousesPage';
import FlocksPage from './pages/flocks/FlocksPage';
import ExternalDataSourcesPage from './pages/external-data-sources/ExternalDataSourcesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Main App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, getCurrentUser, isLoading } = useAuthStore();

  useEffect(() => {
    const hasToken = !!localStorage.getItem('accessToken');
    if (hasToken && !isAuthenticated) {
      getCurrentUser().catch(() => {
        // silently fail -> redirect to signin below
      });
    }
  }, [isAuthenticated, getCurrentUser]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/farms" element={<FarmsPage />} />
      <Route path="/monitoring" element={<MonitoringPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/realtime" element={<RealtimePage />} />
      <Route path="/ai-analytics" element={<AIAnalyticsPage />} />
      <Route path="/devices" element={<DevicesPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/animal-types" element={<AnimalTypesPage />} />
      <Route path="/breeds" element={<BreedsPage />} />
      <Route path="/device-types" element={<DeviceTypesPage />} />
      <Route path="/sensor-types" element={<SensorTypesPage />} />
      <Route path="/zones" element={<ZonesPage />} />
      <Route path="/stations" element={<StationsPage />} />
      <Route path="/feed-types" element={<FeedTypesPage />} />
      <Route path="/formulas" element={<FormulaManagementPage />} />
      <Route path="/houses" element={<HousesPage />} />
      <Route path="/flocks" element={<FlocksPage />} />
      <Route path="/external-data-sources" element={<ExternalDataSourcesPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const { mode } = useThemeStore();
  const theme = React.useMemo(() => createTheme(modernTheme(mode)), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;