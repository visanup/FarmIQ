import { create } from 'zustand';
import { 
  Farm, 
  Animal, 
  Device, 
  SensorReading, 
  DeviceHealth, 
  PerformanceMetric,
  HealthRecord,
  DashboardFilters,
  DashboardMetrics,
  Alert
} from '../types/api';

interface DashboardState {
  // Data
  farms: Farm[];
  animals: Animal[];
  devices: Device[];
  sensorReadings: SensorReading[];
  deviceHealth: DeviceHealth[];
  performanceMetrics: PerformanceMetric[];
  healthRecords: HealthRecord[];
  alerts: Alert[];
  dashboardMetrics: DashboardMetrics | null;

  // Filters
  filters: DashboardFilters;

  // UI State
  selectedFarm: Farm | null;
  selectedAnimal: Animal | null;
  selectedDevice: Device | null;
  isLoading: {
    farms: boolean;
    animals: boolean;
    devices: boolean;
    sensorReadings: boolean;
    deviceHealth: boolean;
    performanceMetrics: boolean;
    healthRecords: boolean;
    alerts: boolean;
    dashboardMetrics: boolean;
  };
  errors: {
    farms: string | null;
    animals: string | null;
    devices: string | null;
    sensorReadings: string | null;
    deviceHealth: string | null;
    performanceMetrics: string | null;
    healthRecords: string | null;
    alerts: string | null;
    dashboardMetrics: string | null;
  };

  // Real-time updates
  isRealTimeEnabled: boolean;
  lastUpdate: string | null;
}

interface DashboardActions {
  // Data setters
  setFarms: (farms: Farm[]) => void;
  setAnimals: (animals: Animal[]) => void;
  setDevices: (devices: Device[]) => void;
  setSensorReadings: (readings: SensorReading[]) => void;
  setDeviceHealth: (health: DeviceHealth[]) => void;
  setPerformanceMetrics: (metrics: PerformanceMetric[]) => void;
  setHealthRecords: (records: HealthRecord[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setDashboardMetrics: (metrics: DashboardMetrics) => void;

  // Selection setters
  setSelectedFarm: (farm: Farm | null) => void;
  setSelectedAnimal: (animal: Animal | null) => void;
  setSelectedDevice: (device: Device | null) => void;

  // Filter setters
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (start: string, end: string) => void;
  setLevel: (level: DashboardFilters['level'], farmId?: string, houseId?: string, deviceId?: string) => void;

  // Loading state
  setLoading: (key: keyof DashboardState['isLoading'], loading: boolean) => void;
  setError: (key: keyof DashboardState['errors'], error: string | null) => void;

  // Real-time updates
  setRealTimeEnabled: (enabled: boolean) => void;
  updateLastUpdate: () => void;

  // Utility actions
  clearAllData: () => void;
  refreshAllData: () => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

const initialFilters: DashboardFilters = {
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    end: new Date().toISOString(),
  },
  level: 'overview',
};

const initialLoadingState = {
  farms: false,
  animals: false,
  devices: false,
  sensorReadings: false,
  deviceHealth: false,
  performanceMetrics: false,
  healthRecords: false,
  alerts: false,
  dashboardMetrics: false,
};

const initialErrorState = {
  farms: null,
  animals: null,
  devices: null,
  sensorReadings: null,
  deviceHealth: null,
  performanceMetrics: null,
  healthRecords: null,
  alerts: null,
  dashboardMetrics: null,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  farms: [],
  animals: [],
  devices: [],
  sensorReadings: [],
  deviceHealth: [],
  performanceMetrics: [],
  healthRecords: [],
  alerts: [],
  dashboardMetrics: null,
  filters: initialFilters,
  selectedFarm: null,
  selectedAnimal: null,
  selectedDevice: null,
  isLoading: initialLoadingState,
  errors: initialErrorState,
  isRealTimeEnabled: true,
  lastUpdate: null,

  // Data setters
  setFarms: (farms) => set({ farms }),
  setAnimals: (animals) => set({ animals }),
  setDevices: (devices) => set({ devices }),
  setSensorReadings: (sensorReadings) => set({ sensorReadings }),
  setDeviceHealth: (deviceHealth) => set({ deviceHealth }),
  setPerformanceMetrics: (performanceMetrics) => set({ performanceMetrics }),
  setHealthRecords: (healthRecords) => set({ healthRecords }),
  setAlerts: (alerts) => set({ alerts }),
  setDashboardMetrics: (dashboardMetrics) => set({ dashboardMetrics }),

  // Selection setters
  setSelectedFarm: (selectedFarm) => set({ selectedFarm }),
  setSelectedAnimal: (selectedAnimal) => set({ selectedAnimal }),
  setSelectedDevice: (selectedDevice) => set({ selectedDevice }),

  // Filter setters
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setDateRange: (start, end) => set((state) => ({
    filters: {
      ...state.filters,
      dateRange: { start, end }
    }
  })),

  setLevel: (level, farmId, houseId, deviceId) => set((state) => ({
    filters: {
      ...state.filters,
      level,
      farmId,
      houseId,
      deviceId
    }
  })),

  // Loading state
  setLoading: (key, loading) => set((state) => ({
    isLoading: { ...state.isLoading, [key]: loading }
  })),

  setError: (key, error) => set((state) => ({
    errors: { ...state.errors, [key]: error }
  })),

  // Real-time updates
  setRealTimeEnabled: (isRealTimeEnabled) => set({ isRealTimeEnabled }),
  updateLastUpdate: () => set({ lastUpdate: new Date().toISOString() }),

  // Utility actions
  clearAllData: () => set({
    farms: [],
    animals: [],
    devices: [],
    sensorReadings: [],
    deviceHealth: [],
    performanceMetrics: [],
    healthRecords: [],
    alerts: [],
    dashboardMetrics: null,
    errors: initialErrorState,
  }),

  refreshAllData: async () => {
    // This would be implemented with actual API calls
    // For now, just update the timestamp
    set({ lastUpdate: new Date().toISOString() });
  },
}));

