# TMD Weather API Integration

## Overview

This implementation integrates the Thai Meteorological Department (TMD) API into the FarmIQ Analytics Dashboard to provide area-level weather forecasting specifically designed for agricultural use.

## Features

### 🌍 Area-Level Weather Forecasting
- **10 Major Thai Regions**: Pre-configured regions including Chiang Mai, Bangkok, Nakhon Ratchasima, Khon Kaen, and more
- **Custom Area Support**: Ability to specify custom coordinates for any area in Thailand
- **High Resolution Data**: Up to 2km spatial resolution using TMD Domain 3

### 📊 Weather Data
- **Current Conditions**: Temperature, humidity, wind speed/direction, pressure, rainfall, cloud cover
- **Extended Forecasts**: Up to 72-hour hourly forecasts with detailed meteorological data
- **Agricultural Metrics**: UV index calculation, solar radiation, agricultural impact assessment

### 🚨 Smart Alerts
- **Heavy Rain Warnings**: Automatic alerts for rainfall exceeding 35mm
- **Temperature Extremes**: Alerts for temperatures above 35°C or below 15°C
- **Strong Wind Warnings**: Notifications for winds exceeding 50 km/h
- **Disease Risk Assessment**: Fungal disease risk based on humidity and temperature combinations

### 🌱 Agricultural Impact Analysis
- **Irrigation Efficiency**: Calculated based on upcoming rainfall and humidity
- **Crop Growth Conditions**: Optimal growing condition assessment
- **Disease Risk Levels**: Automated risk calculation for plant diseases
- **Actionable Recommendations**: Context-specific farming advice

## API Integration

### TMD API Domains
The system supports all TMD API domains with different resolutions and forecast ranges:

| Domain | Resolution | Forecast Range | Update Frequency |
|--------|------------|----------------|------------------|
| 0      | 27km       | 126 days       | 6 hours         |
| 1      | 18km       | 10 days        | 3 hours         |
| 2      | 6km        | 72 hours       | 1 hour          |
| 3      | 2km        | 48 hours       | 1 hour          |

### Configuration

#### Environment Variables
```bash
# Optional: Set your TMD API token (if available)
VITE_TMD_API_TOKEN=your_tmd_api_token_here

# Development mode (uses mock service)
DEV=true
```

#### Service Selection
The system automatically chooses between real TMD API and mock service:
- **Production**: Uses real TMD API if `VITE_TMD_API_TOKEN` is provided
- **Development**: Uses mock service with realistic data patterns
- **Fallback**: Mock service if API token is unavailable

### Weather Service Usage

```typescript
import { weatherService, THAILAND_REGIONS } from '@/services/weather';

// Get weather for predefined region
const weatherData = await weatherService.getRegionWeather('Chiang Mai');

// Get weather for custom area
const customWeather = await weatherService.getCustomAreaWeather(
  'My Farm',
  18.5, 98.5,  // bottom-left coordinates
  19.0, 99.0   // top-right coordinates
);

// Generate weather alerts
const alerts = weatherService.getWeatherAlerts(weatherData);
```

## User Interface Features

### 🎯 Region Selection
- Dropdown selector for major Thai agricultural regions
- Real-time weather data loading with progress indicators
- Last updated timestamp display

### 📱 Responsive Design
- Mobile-optimized weather cards and layouts
- Touch-friendly controls and navigation
- Adaptive typography and spacing

### 🌓 Dark/Light Mode Support
- Theme-aware weather icons and colors
- Consistent color schemes across all weather components
- Accessibility-compliant contrast ratios

### 📈 Three-Tab Interface

#### 1. 7-Day Forecast
- Daily weather summaries with high/low temperatures
- Precipitation forecasts with visual progress bars
- Weather condition icons and descriptions
- Humidity levels and trend indicators

#### 2. Agricultural Impact
- Real-time irrigation recommendations
- Temperature and wind management advice
- Disease risk assessment and prevention tips
- Dynamic impact scoring with visual indicators

#### 3. Historical Data & API Info
- TMD API domain information and capabilities
- Current data source and coordinates display
- Available regions and coverage areas
- Technical specifications and limitations

## Technical Implementation

### Service Architecture
```
services/weather/
├── tmdService.ts      # Real TMD API integration
├── mockTMDService.ts  # Development mock service
└── index.ts           # Service selector and exports
```

### Data Processing Pipeline
1. **Raw TMD Data**: Direct API response with meteorological variables
2. **Data Transformation**: Unit conversions and aggregations
3. **Agricultural Analysis**: Impact calculations and risk assessments
4. **Alert Generation**: Context-aware warnings and recommendations
5. **UI Rendering**: Responsive components with loading states

### Key Components
- **WeatherPage.tsx**: Main weather dashboard component
- **TMDService**: Real API integration with error handling
- **MockTMDService**: Development service with realistic data patterns
- **Agricultural Impact Calculator**: Smart recommendations engine

## Benefits for Agricultural Users

### 🎯 Precision Agriculture
- **Micro-climate Monitoring**: 2-6km resolution for precise local conditions
- **Irrigation Optimization**: Data-driven watering recommendations
- **Crop Protection**: Early warning system for adverse weather

### 📊 Data-Driven Decisions
- **Scientific Accuracy**: Official TMD meteorological data
- **Predictive Analytics**: Multi-day forecasting for planning
- **Risk Mitigation**: Proactive alerts and recommendations

### 🚀 Operational Efficiency
- **Time Savings**: Automated weather monitoring and alerts
- **Resource Optimization**: Smart irrigation and crop management
- **Cost Reduction**: Preventive measures based on weather predictions

## Troubleshooting

### Common Issues
1. **API Token**: Ensure `VITE_TMD_API_TOKEN` is set for production use
2. **Network Timeouts**: TMD API can be slow; 30-second timeout is configured
3. **Rate Limits**: TMD API has usage limits; implement caching if needed
4. **CORS Issues**: Use backend proxy for production TMD API calls

### Mock Service
- Automatically activated in development mode
- Generates realistic weather patterns
- Includes seasonal variations and extreme weather scenarios
- Perfect for testing and demonstration

## Future Enhancements

### Planned Features
- **Historical Weather Analysis**: Long-term climate trends
- **Crop-Specific Recommendations**: Tailored advice for different crops
- **Weather-Based Automation**: Integration with IoT irrigation systems
- **Satellite Data Integration**: Enhanced accuracy with remote sensing

### API Improvements
- **Caching Layer**: Reduce API calls and improve performance
- **Offline Support**: Local weather data storage
- **Push Notifications**: Mobile alerts for critical weather events
- **Multi-language Support**: Thai language interface option