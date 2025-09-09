// Mock data for development and demonstration
import { 
  Farm, 
  Animal, 
  Device, 
  SensorReading, 
  DeviceHealth, 
  PerformanceMetric,
  HealthRecord,
  Customer,
  DashboardMetrics,
  Alert
} from '../../types/api';

// Mock Farms
export const mockFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'ฟาร์มโคนมสวนผัก',
    location: 'จังหวัดเชียงใหม่',
    size: 25.5,
    type: 'dairy',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'farm-2',
    name: 'ฟาร์มไก่ไข่บ้านนา',
    location: 'จังหวัดนครราชสีมา',
    size: 15.2,
    type: 'poultry',
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
  {
    id: 'farm-3',
    name: 'ฟาร์มหมูออร์แกนิก',
    location: 'จังหวัดกาญจนบุรี',
    size: 30.8,
    type: 'swine',
    isActive: true,
    createdAt: '2024-01-05T07:30:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: 'farm-4',
    name: 'ฟาร์มโคเนื้อภูเขา',
    location: 'จังหวัดแม่ฮ่องสอน',
    size: 45.3,
    type: 'cattle',
    isActive: true,
    createdAt: '2024-01-12T06:45:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
  },
  {
    id: 'farm-5',
    name: 'ฟาร์มผักไฮโดรโปนิกส์',
    location: 'จังหวัดปทุมธานี',
    size: 8.7,
    type: 'vegetable',
    isActive: false,
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 'farm-6',
    name: 'ฟาร์มกุ้งกุลาดำ',
    location: 'จังหวัดสงขลา',
    size: 12.4,
    type: 'aquaculture',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:45:00Z',
  },
];

// Mock Animals
export const mockAnimals: Animal[] = [
  {
    id: 'animal-1',
    farmId: 'farm-1',
    houseId: 'house-1',
    tagNumber: 'COW-001',
    breed: 'โฮลสไตน์',
    birthDate: '2022-03-15T00:00:00Z',
    gender: 'female',
    weight: 450.5,
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'animal-2',
    farmId: 'farm-1',
    houseId: 'house-1',
    tagNumber: 'COW-002',
    breed: 'โฮลสไตน์',
    birthDate: '2021-11-20T00:00:00Z',
    gender: 'female',
    weight: 520.3,
    status: 'active',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'animal-3',
    farmId: 'farm-2',
    houseId: 'house-2',
    tagNumber: 'CHK-001',
    breed: 'ไก่ไข่',
    birthDate: '2023-06-10T00:00:00Z',
    gender: 'female',
    weight: 1.8,
    status: 'active',
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
];

// Mock Devices
export const mockDevices: Device[] = [
  {
    id: 'device-1',
    farmId: 'farm-1',
    houseId: 'house-1',
    deviceTypeId: 'sensor-temp',
    serialNumber: 'TEMP-001',
    name: 'เซ็นเซอร์อุณหภูมิ 1',
    location: { x: 10.5, y: 5.2, z: 2.0 },
    isActive: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'device-2',
    farmId: 'farm-1',
    houseId: 'house-1',
    deviceTypeId: 'sensor-humidity',
    serialNumber: 'HUM-001',
    name: 'เซ็นเซอร์ความชื้น 1',
    location: { x: 12.3, y: 4.8, z: 1.8 },
    isActive: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'device-3',
    farmId: 'farm-2',
    houseId: 'house-2',
    deviceTypeId: 'sensor-temp',
    serialNumber: 'TEMP-002',
    name: 'เซ็นเซอร์อุณหภูมิ 2',
    location: { x: 8.7, y: 6.1, z: 2.2 },
    isActive: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
];

// Mock Device Health
export const mockDeviceHealth: DeviceHealth[] = [
  {
    id: 'health-1',
    deviceId: 'device-1',
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    batteryLevel: 85,
    signalStrength: 92,
    temperature: 25.3,
    errors: [],
    warnings: [],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'health-2',
    deviceId: 'device-2',
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    batteryLevel: 78,
    signalStrength: 88,
    temperature: 24.8,
    errors: [],
    warnings: ['Low battery'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'health-3',
    deviceId: 'device-3',
    status: 'OFFLINE',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    batteryLevel: 45,
    signalStrength: 0,
    temperature: null,
    errors: ['Connection lost'],
    warnings: ['Low battery', 'No signal'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
];

// Mock Sensor Readings
export const mockSensorReadings: SensorReading[] = [
  {
    id: 'reading-1',
    deviceId: 'device-1',
    farmId: 'farm-1',
    houseId: 'house-1',
    sensorType: 'temperature',
    value: 25.3,
    unit: '°C',
    location: { x: 10.5, y: 5.2, z: 2.0 },
    metadata: { accuracy: 0.1, calibration_date: '2024-01-01' },
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reading-2',
    deviceId: 'device-2',
    farmId: 'farm-1',
    houseId: 'house-1',
    sensorType: 'humidity',
    value: 65.2,
    unit: '%',
    location: { x: 12.3, y: 4.8, z: 1.8 },
    metadata: { accuracy: 0.5, calibration_date: '2024-01-01' },
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reading-3',
    deviceId: 'device-1',
    farmId: 'farm-1',
    houseId: 'house-1',
    sensorType: 'temperature',
    value: 24.8,
    unit: '°C',
    location: { x: 10.5, y: 5.2, z: 2.0 },
    metadata: { accuracy: 0.1, calibration_date: '2024-01-01' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: 'metric-1',
    animalId: 'animal-1',
    farmId: 'farm-1',
    metric: 'milk_production',
    value: 25.5,
    unit: 'liters',
    date: new Date().toISOString(),
    notes: 'Daily production',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metric-2',
    animalId: 'animal-2',
    farmId: 'farm-1',
    metric: 'milk_production',
    value: 28.3,
    unit: 'liters',
    date: new Date().toISOString(),
    notes: 'Daily production',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'metric-3',
    animalId: 'animal-3',
    farmId: 'farm-2',
    metric: 'egg_production',
    value: 0.95,
    unit: 'eggs/day',
    date: new Date().toISOString(),
    notes: 'Daily production rate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Health Records
export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'health-record-1',
    animalId: 'animal-1',
    farmId: 'farm-1',
    type: 'vaccination',
    description: 'วัคซีนป้องกันโรคปากและเท้าเปื่อย',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    veterinarian: 'ดร.สมชาย ใจดี',
    notes: 'ฉีดวัคซีนตามกำหนด',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'health-record-2',
    animalId: 'animal-2',
    farmId: 'farm-1',
    type: 'checkup',
    description: 'ตรวจสุขภาพประจำเดือน',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    veterinarian: 'ดร.สมชาย ใจดี',
    notes: 'สุขภาพแข็งแรงดี',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'บริษัท ฟาร์มโคนม จำกัด',
    email: 'info@dairyfarm.co.th',
    phone: '02-123-4567',
    address: '123 ถนนเกษตรกรรม เขตบางเขน กรุงเทพฯ 10900',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    createdById: 'user-1',
  },
  {
    id: 'customer-2',
    name: 'ฟาร์มไก่ไข่บ้านนา',
    email: 'contact@chickenfarm.co.th',
    phone: '044-123-4567',
    address: '456 หมู่ 2 ตำบลนาเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    createdById: 'user-1',
  },
];

// Mock Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalFarms: 3,
  totalAnimals: 150,
  totalDevices: 12,
  onlineDevices: 10,
  alerts: 8,
  criticalAlerts: 2,
  lastUpdate: new Date().toISOString(),
};

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'อุณหภูมิสูงเกินไป',
    message: 'อุณหภูมิในเล้า 1 สูงเกิน 35°C',
    timestamp: new Date().toISOString(),
    deviceId: 'device-1',
    farmId: 'farm-1',
    acknowledged: false,
    severity: 'high',
  },
  {
    id: 'alert-2',
    type: 'error',
    title: 'อุปกรณ์ออฟไลน์',
    message: 'เซ็นเซอร์ TEMP-002 ออฟไลน์เป็นเวลา 30 นาที',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deviceId: 'device-3',
    farmId: 'farm-2',
    acknowledged: false,
    severity: 'critical',
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'คุณภาพน้ำดี',
    message: 'ค่า pH ของน้ำอยู่ในช่วงปกติ',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    farmId: 'farm-1',
    acknowledged: true,
    severity: 'low',
  },
  {
    id: 'alert-4',
    type: 'warning',
    title: 'แบตเตอรี่ต่ำ',
    message: 'แบตเตอรี่ของเซ็นเซอร์ HUM-001 เหลือ 20%',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deviceId: 'device-2',
    farmId: 'farm-1',
    acknowledged: false,
    severity: 'medium',
  },
];

// Mock Dashboard Summary
export const mockDashboardSummary = {
  totalDevices: 12,
  onlineDevices: 10,
  totalAlerts: 8,
  criticalAlerts: 2,
  lastUpdate: new Date().toISOString(),
};

// Helper function to generate time series data
export const generateTimeSeriesData = (days: number = 7, interval: number = 60) => {
  const data = [];
  const now = new Date();
  
  for (let i = days * 24 * 60; i >= 0; i -= interval) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.random() * 10 + 20, // Random value between 20-30
    });
  }
  
  return data;
};
