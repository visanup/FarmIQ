import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { modernTheme } from './theme/modernTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores/authStore';

// Import pages
import DashboardPage from './pages/dashboard/DashboardPage';
import SignInPage from './pages/auth/SignInPage';
import FarmsPage from './pages/farms/FarmsPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import DevicesPage from './pages/devices/DevicesPage';
import CustomersPage from './pages/customers/CustomersPage';
import RealtimePage from './pages/realtime/RealtimePage';
import AIAnalyticsPage from './pages/ai/AIAnalyticsPage';

// Use modern theme
const theme = modernTheme;

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
  const { isAuthenticated, user } = useAuthStore();

  // Auto-login for demo purposes
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login with demo credentials
      const demoUser = {
        id: '1',
        name: 'Demo User',
        email: 'demo@farmiq.com',
        role: 'ADMIN',
      };
      localStorage.setItem('auth', JSON.stringify({ user: demoUser, token: 'demo-token' }));
      window.location.reload();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
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
      <Route path="/settings" element={<div>Settings Page - Coming Soon</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
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