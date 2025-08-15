// src/App.tsx
// src/App.tsx

import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/auth/Profile';
import Dashboard from './pages/dashboard/dashboard';
import DevicePage from './pages/devices/DevicePage';
import DeviceDetail from './pages/devices/DeviceDetail';
import DeviceForm from './pages/devices/DeviceForm';
import AlertRecord from './pages/alerts/alerts';
import SettingsPage from './pages/settings/settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('accessToken'))
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/signup" element={<Signup />} />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Dashboard at "/" */}
          <Route index element={<Dashboard />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Devices routes */}
          <Route path="devices" element={<DevicePage />} />
          <Route path="devices/:id" element={<DeviceDetail />} />
          <Route path="devices/edit/:id" element={<DeviceForm />} />

          {/* Alert routes */}
          <Route path="alerts" element={<AlertRecord />} />

          {/* settings routes */}
          <Route path="settings" element={<SettingsPage />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;

