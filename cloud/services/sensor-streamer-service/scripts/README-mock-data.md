# Mock Data Generation Scripts

## Overview
Scripts for generating mock data to test the sensor-streamer-service API endpoints.

## Scripts

### 1. `generate-mock-data.js` - Full Mock Data Generator
Generates comprehensive mock data with:
- **5 Customers** with 3 farms each (15 farms total)
- **45 Houses** (3 houses per farm)
- **540 Devices** (12 sensor types per house)
- **233,280 Sensor Readings** (every 10 minutes for 3 days)
- **3,240 Lab Readings** (every 4 hours for 3 days)
- **12,960 Sweep Readings** (every 1 hour for 3 days)
- **12,960 Device Health Records** (every 1 hour for 3 days)
- **233,280 Data Ingestion Logs** (every 10 minutes for 3 days)

### 2. `simple-mock-data.js` - Simple Test Data
Generates minimal test data for quick API testing:
- **2 Sensor Readings**
- **1 Lab Reading**
- **1 Sweep Reading**
- **1 Device Health Record**
- **1 Data Ingestion Log**

## Usage

### Prerequisites
1. Ensure the sensor-streamer-service is running
2. Update the API_KEY in the script files
3. Ensure the database is set up with TimescaleDB

### Run Full Mock Data Generation
```bash
# From sensor-streamer-service directory
yarn mock:generate

# Or directly
node scripts/generate-mock-data.js
```

### Run Simple Mock Data
```bash
# From sensor-streamer-service directory
node scripts/simple-mock-data.js
```

## Data Structure

### Sensor Types
- `TEMPERATURE` - Temperature sensor (°C)
- `HUMIDITY` - Humidity sensor (%)
- `CO2` - CO₂ sensor (ppm)
- `NH3` - NH₃ sensor (ppm)
- `PH` - pH sensor (pH)
- `TDS` - TDS sensor (ppm)
- `EC` - EC sensor (mS/cm)
- `WATER_TEMP` - Water temperature sensor (°C)
- `WATER_VOLUME` - Water volume sensor (L)
- `ILLUMINANCE` - Illuminance sensor (lux)
- `PHOTOPERIOD` - Photoperiod sensor (hours)
- `VOCS` - VOCs sensor (ppb)

### Test Types (Lab Readings)
- `WATER_QUALITY` - Water quality test
- `SOIL_ANALYSIS` - Soil analysis
- `NUTRIENT_LEVEL` - Nutrient level test
- `PH_TEST` - pH test
- `TDS_TEST` - TDS test
- `EC_TEST` - EC test
- `TURBIDITY` - Turbidity test
- `DISSOLVED_OXYGEN` - Dissolved oxygen test
- `AMMONIA_LEVEL` - Ammonia level test
- `NITRATE_LEVEL` - Nitrate level test
- `PHOSPHATE_LEVEL` - Phosphate level test

### Sample Types
- `WATER_SAMPLE` - Water sample
- `SOIL_SAMPLE` - Soil sample
- `PLANT_SAMPLE` - Plant sample
- `FEED_SAMPLE` - Feed sample
- `WASTE_SAMPLE` - Waste sample

### Device Statuses
- `ONLINE` - Device is online and functioning
- `OFFLINE` - Device is offline
- `MAINTENANCE` - Device is under maintenance
- `ERROR` - Device has an error

## API Endpoints

The mock data is sent to these endpoints:
- `POST /api/sensors/batch` - Sensor readings
- `POST /api/lab-readings/batch` - Lab readings
- `POST /api/sweep-readings/batch` - Sweep readings
- `POST /api/device-health/batch` - Device health records
- `POST /api/data-ingestion-logs/batch` - Data ingestion logs

## Configuration

Update these variables in the script files:
```javascript
const API_BASE_URL = 'http://localhost:7302/api';
const API_KEY = 'your-api-key-here';
```

## Data Patterns

### Sensor Values
- **Temperature**: 20-35°C
- **Humidity**: 40-90%
- **CO₂**: 300-2000 ppm
- **NH₃**: 0-50 ppm
- **pH**: 6.0-8.5
- **TDS**: 100-2000 ppm
- **EC**: 0.1-3.0 mS/cm
- **Water Temp**: 15-30°C
- **Water Volume**: 0-1000 L
- **Illuminance**: 0-10000 lux (daytime: 1000-10000, nighttime: 0-100)
- **Photoperiod**: 0-16 hours (daytime: 8-16, nighttime: 0)
- **VOCs**: 0-100 ppb

### Time Patterns
- **Sensor Readings**: Every 10 minutes
- **Lab Readings**: Every 4 hours
- **Sweep Readings**: Every 1 hour
- **Device Health**: Every 1 hour
- **Data Logs**: Every 10 minutes

## Troubleshooting

### Common Issues
1. **API Connection Failed**: Check if the service is running on port 7302
2. **Authentication Failed**: Verify the API_KEY is correct
3. **Database Error**: Ensure TimescaleDB is set up and running
4. **Memory Issues**: Use the simple mock data script for testing

### Debug Mode
Add console.log statements to debug data generation:
```javascript
console.log('Generated device:', device);
console.log('Generated reading:', reading);
```

## Performance Notes

- Full mock data generation may take several minutes
- Data is sent in batches of 100 records
- Consider using the simple mock data for development
- Monitor memory usage during large data generation
