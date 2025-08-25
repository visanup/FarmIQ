import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import Layout from './components/layout/Layout';

// Import pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DevicesPage from './pages/devices/DevicesPage';
import AlertsPage from './pages/alerts/AlertsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Import new professional pages
import FarmManagementPage from './pages/farms/FarmManagementPage';
import ReportsPage from './pages/reports/ReportsPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import EconomicsPage from './pages/economics/EconomicsPage';
import WeatherPage from './pages/weather/WeatherPage';
import FeedManagementPage from './pages/feed/FeedManagementPage';
import FormulaManagementPage from './pages/formula/FormulaManagementPage';
import CustomerManagementPage from './pages/customer/CustomerManagementPage';
import BillingManagementPage from './pages/billing/BillingManagementPage';

// Import auth pages
import SignInPage from './pages/auth/SignInPage.tsx';
import SignUpPage from './pages/auth/SignUpPage.tsx';

const AppContent: React.FC = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardProvider>
        <Layout
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          onLogout={signOut}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/farms" element={<FarmManagementPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/feed" element={<FeedManagementPage />} />
            <Route path="/formula" element={<FormulaManagementPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/economics" element={<EconomicsPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/customers" element={<CustomerManagementPage />} />
            <Route path="/billing" element={<BillingManagementPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </DashboardProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;