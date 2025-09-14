# 🌱 FarmIQ Analytics Dashboard

A modern, professional analytics dashboard for FarmIQ agricultural management system with **comprehensive mock data** and **agriculture-themed green design**.

## ✨ Features

- **🎯 Real-time Monitoring**: Live sensor data and device status
- **🏡 Farm Management**: Comprehensive farm and animal tracking (6 farms)
- **📊 Analytics & Reports**: Performance metrics and health analysis
- **📱 Device Management**: IoT sensor monitoring and control (12 devices)
- **👥 Customer Management**: Multi-tenant customer support (2 customers)
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🎨 Agriculture Theme**: Beautiful green color scheme for farming

## 🚀 Quick Start

### 1. Access Dashboard
Open your browser and go to: **http://localhost:3001**

### 2. Login with Demo Account
- **Email**: `demo@farmiq.com`
- **Password**: `demo123`

### 3. Explore Features
- **Dashboard**: Overview with real-time metrics and beautiful charts
- **Farms**: Manage 6 different farms (dairy, poultry, swine, cattle, vegetable, aquaculture)
- **Monitoring**: Real-time device status and sensor data
- **Analytics**: Performance charts and health analysis
- **Real-time**: Live sensor data with interactive charts and filtering
- **AI Analytics**: Predictive analytics with FCR, ADG, weight distribution, and health predictions
- **Devices**: IoT sensor management
- **Customers**: Customer and farm relationship management

## 🎨 Agriculture Theme

The dashboard features a beautiful **green color scheme** perfect for agriculture:

- **Primary Green**: `#2e7d32` (Forest Green)
- **Secondary Green**: `#8bc34a` (Light Green)
- **Success Green**: `#4caf50` (Success Green)
- **Background**: `#f1f8e9` (Very Light Green)
- **Text**: Dark green for excellent readability

## 📊 Mock Data Included

### Farms (6 farms)
- **ฟาร์มโคนมสวนผัก** - เชียงใหม่ (25.5 ไร่)
- **ฟาร์มไก่ไข่บ้านนา** - นครราชสีมา (15.2 ไร่)
- **ฟาร์มหมูออร์แกนิก** - กาญจนบุรี (30.8 ไร่)
- **ฟาร์มโคเนื้อภูเขา** - แม่ฮ่องสอน (45.3 ไร่)
- **ฟาร์มผักไฮโดรโปนิกส์** - ปทุมธานี (8.7 ไร่)
- **ฟาร์มกุ้งกุลาดำ** - สงขลา (12.4 ไร่)

### Animals (3 animals)
- **โค 2 ตัว**: โฮลสไตน์, น้ำหนัก 450-520 กก.
- **ไก่ 1 ตัว**: ไก่ไข่, น้ำหนัก 1.8 กก.

### Devices (12 devices)
- **เซ็นเซอร์อุณหภูมิ**: 6 ตัว
- **เซ็นเซอร์ความชื้น**: 4 ตัว
- **เซ็นเซอร์คุณภาพอากาศ**: 2 ตัว

### Customers (2 customers)
- **บริษัท ฟาร์มโคนม จำกัด**
- **ฟาร์มไก่ไข่บ้านนา**

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Material-UI v7 with custom green theme
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts, Chart.js
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Dashboard layout
├── pages/              # Page components
│   ├── auth/           # Sign in page
│   ├── dashboard/      # Main dashboard
│   ├── farms/          # Farm management (6 farms)
│   ├── monitoring/     # Device monitoring (12 devices)
│   ├── analytics/      # Data analytics with charts
│   ├── devices/        # Device management
│   └── customers/      # Customer management (2 customers)
├── stores/             # Zustand state stores
├── hooks/              # Custom React hooks
├── services/           # API services
│   └── api/            # Mock data and API client
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## 🎯 Key Features

### Dashboard Page
- **Real-time Metrics**: 12 devices, 3 farms, 150 animals
- **Status Indicators**: Online/offline devices with color coding
- **Alert System**: 4 different alert types
- **Quick Actions**: Refresh, view details, manage settings

### Farms Page
- **Farm Cards**: Beautiful cards with farm information
- **Statistics**: Animal count, device count, online status
- **Farm Types**: Dairy 🐄, Poultry 🐔, Swine 🐷, Cattle 🐂
- **Management**: Add, edit, view, delete farms

### Monitoring Page
- **Device Status**: Real-time device health monitoring
- **Sensor Data**: Temperature, humidity, air quality readings
- **Charts**: 24-hour trend charts
- **Alerts**: Critical alerts and warnings

### Analytics Page
- **Performance Charts**: Milk production, egg production, weight growth
- **Health Analysis**: Pie charts for health status
- **Trend Analysis**: 30-day performance trends
- **Custom Reports**: Filterable by farm, time range

### Devices Page
- **Device Management**: Add, edit, view, delete devices
- **Health Monitoring**: Battery, signal strength, temperature
- **Sensor Readings**: Real-time sensor data
- **Status Tracking**: Online/offline with visual indicators

### Customers Page
- **Customer Management**: Company information and contact details
- **Farm Relationships**: Link customers to their farms
- **Statistics**: Farm count, total size, active status
- **Contact Information**: Email, phone, address management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager

### Installation
1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development server:
   ```bash
   yarn dev
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

### Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript checking

## 🎨 UI/UX Features

### Agriculture Theme
- **Green Color Palette**: Perfect for agricultural applications
- **Nature Icons**: Farm, animal, and device icons
- **Professional Design**: Clean, modern interface
- **Responsive Layout**: Works on all screen sizes

### Interactive Elements
- **Hover Effects**: Smooth animations and transitions
- **Status Indicators**: Color-coded status chips
- **Progress Bars**: Battery and signal strength indicators
- **Tooltips**: Helpful information on hover

### Data Visualization
- **Real-time Charts**: Live data updates
- **Interactive Graphs**: Hover for detailed information
- **Color Coding**: Consistent color scheme throughout
- **Responsive Charts**: Adapt to different screen sizes

## 🔧 Development

### Mock Data System
- **Comprehensive Data**: All pages have realistic mock data
- **Realistic Values**: Thai farm names, locations, and data
- **Dynamic Updates**: Data refreshes every 30 seconds
- **Error Simulation**: Realistic error states and loading

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Component Architecture**: Reusable, maintainable components
- **Custom Hooks**: Clean data fetching logic

## 🌟 Highlights

- **🎨 Beautiful Green Theme**: Perfect for agriculture
- **📊 Rich Mock Data**: 6 farms, 12 devices, 3 animals, 2 customers
- **📱 Fully Responsive**: Works on all devices
- **⚡ Real-time Updates**: Auto-refresh every 30 seconds
- **🔧 Professional Code**: Clean, maintainable, well-documented
- **🎯 Complete Features**: All major farm management features

## 📞 Support

The dashboard is fully functional with mock data. All features work as expected:
- ✅ Authentication system
- ✅ Farm management
- ✅ Device monitoring
- ✅ Analytics and reporting
- ✅ Customer management
- ✅ Real-time updates
- ✅ Responsive design

---

## 🎉 Ready to Use!

The FarmIQ Analytics Dashboard is now **fully functional** with beautiful mock data and a professional agriculture theme. Simply open [http://localhost:3001](http://localhost:3001) and start exploring! 🚀