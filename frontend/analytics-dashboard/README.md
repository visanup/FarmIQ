# FarmIQ Analytics Dashboard

## 🌱 Overview

A modern, clean analytics dashboard for farm management with authentication system. Built with React, TypeScript, and Material-UI with a simple, elegant design.

## ✨ Features

- **Clean Authentication System**
  - Sign In page with elegant design
  - Sign Up page with form validation
  - Secure JWT-based authentication
  - Demo mode for testing

- **Modern UI Design**
  - Simple, clean color scheme
  - Responsive design for all devices
  - Dark/Light theme support
  - Smooth animations and transitions

- **Navigation**
  - Clean sidebar with farm-themed icons
  - Responsive navbar
  - Context-aware breadcrumbs

- **Professional Dashboard Pages**
  - Dashboard overview with KPIs
  - Farm Management for multi-farm operations
  - Real-time Monitoring with alerts
  - Comprehensive Reports and analytics
  - Economics and financial tracking
  - Weather data and environmental factors
  - Analytics and insights
  - Device management
  - Alerts and notifications
  - Settings and configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Navigate to the analytics dashboard directory:
```bash
cd frontend/analytics-dashboard
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser and go to `http://localhost:4120`

## 🌾 Professional Pages

### 1. **Farm Management** (`/farms`)
- Multi-farm overview and management
- Farm performance metrics and KPIs
- Crop tracking and operational data
- Farm health monitoring
- Add/Edit farm functionality

### 2. **Real-time Monitoring** (`/monitoring`)
- Live sensor data visualization
- Critical alerts and warnings
- Device status monitoring
- System health dashboard
- Configurable alert settings

### 3. **Reports & Analytics** (`/reports`)
- Comprehensive report generation
- Performance summaries
- Custom report builder
- Scheduled reporting
- Data visualization options

### 4. **Economics & Finance** (`/economics`)
- Cost analysis by category
- Budget vs actual tracking
- Profitability metrics
- Transaction history
- Financial planning tools

### 5. **Weather & Environment** (`/weather`)
- Current weather conditions
- 7-day weather forecast
- Agricultural impact analysis
- Weather alerts and warnings
- Historical climate data

### 6. **Analytics** (`/analytics`)
- Advanced data analytics
- Trend analysis
- Predictive insights
- Performance comparisons

### 7. **Device Management** (`/devices`)
- IoT device overview
- Device health monitoring
- Configuration management
- Maintenance schedules

## 🔐 Demo Authentication

For demonstration purposes, the app includes a mock authentication system:

**Demo Credentials:**
- Username: `demo`
- Password: `demo`

You can also test the sign-up functionality which will simulate account creation.

## 🎨 Design Features

### Color Scheme
- **Primary**: Clean indigo (#6366f1)
- **Secondary**: Clean emerald (#10b981)
- **Accent**: Clean cyan (#06b6d4)
- **Background**: Light gray (#f8fafc) / Dark slate (#0f172a)

### Typography
- Clean, modern Roboto font family
- Consistent typography scale
- Proper contrast ratios for accessibility

### Components
- Rounded corners for modern feel
- Subtle shadows and borders
- Smooth hover transitions
- Consistent spacing and padding

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🌓 Theme Support

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Modern dark interface
- Toggle between themes in the user menu

## 🔧 Configuration

### Theme Customization

Edit `src/theme.ts` to customize colors, typography, and component styles.

### Authentication

- Set `DEMO_MODE = false` in `src/services/auth/authService.ts` to connect to a real backend
- Update API endpoints in `src/services/api/client.ts`

## 📁 Project Structure

```
src/
├── components/
│   └── layout/
│       └── Layout.tsx          # Main layout with navbar and sidebar
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── pages/
│   ├── auth/
│   │   ├── SignInPage.tsx      # Clean sign-in page
│   │   └── SignUpPage.tsx      # Clean sign-up page
│   ├── dashboard/              # Dashboard overview
│   ├── farms/
│   │   └── FarmManagementPage.tsx # Multi-farm management
│   ├── monitoring/
│   │   └── MonitoringPage.tsx     # Real-time monitoring
│   ├── reports/
│   │   └── ReportsPage.tsx        # Comprehensive reports
│   ├── economics/
│   │   └── EconomicsPage.tsx      # Financial tracking
│   ├── weather/
│   │   └── WeatherPage.tsx        # Weather data
│   ├── analytics/              # Advanced analytics
│   ├── devices/                # Device management
│   ├── alerts/                 # Alert management
│   └── settings/               # Configuration
├── services/
│   ├── auth/
│   │   └── authService.ts      # Authentication service
│   └── api/
│       └── client.ts           # API client
├── types/                      # TypeScript type definitions
├── theme.ts                    # Material-UI theme configuration
└── App.tsx                     # Main app component
```

## 🎯 Usage

1. **Sign In**: Use demo credentials or create a new account
2. **Navigation**: Use the sidebar to navigate between different sections
3. **Theme Toggle**: Click the profile menu to toggle between light/dark themes
4. **Sign Out**: Use the profile menu to sign out

## 🤝 Contributing

1. Keep the design clean and simple
2. Follow the existing color scheme
3. Ensure responsive design
4. Add proper TypeScript types
5. Test on both light and dark themes

## 📄 License

This project is part of the FarmIQ ecosystem.