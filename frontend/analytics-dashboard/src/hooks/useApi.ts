import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api/client';
import { 
  Farm, 
  Animal, 
  Device, 
  SensorReading, 
  DeviceHealth, 
  PerformanceMetric,
  HealthRecord,
  Customer,
  DashboardFilters,
  DashboardMetrics
} from '../types/api';

// Query keys
export const queryKeys = {
  farms: ['farms'] as const,
  farm: (id: string) => ['farms', id] as const,
  animals: (filters?: { farmId?: string; houseId?: string }) => ['animals', filters] as const,
  animal: (id: string) => ['animals', id] as const,
  devices: (filters?: { farmId?: string; houseId?: string }) => ['devices', filters] as const,
  device: (id: string) => ['devices', id] as const,
  sensorReadings: (filters?: any) => ['sensor-readings', filters] as const,
  deviceHealth: (filters?: any) => ['device-health', filters] as const,
  performanceMetrics: (filters?: any) => ['performance-metrics', filters] as const,
  healthRecords: (filters?: any) => ['health-records', filters] as const,
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  dashboardMetrics: (filters: DashboardFilters) => ['dashboard-metrics', filters] as const,
  dashboardSummary: ['dashboard-summary'] as const,
};

// Farms
export const useFarms = () => {
  return useQuery({
    queryKey: queryKeys.farms,
    queryFn: () => apiClient.getFarms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFarm = (id: string) => {
  return useQuery({
    queryKey: queryKeys.farm(id),
    queryFn: () => apiClient.getFarm(id),
    enabled: !!id,
  });
};

// Animals
export const useAnimals = (filters?: { farmId?: string; houseId?: string }) => {
  return useQuery({
    queryKey: queryKeys.animals(filters),
    queryFn: () => apiClient.getAnimals(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: queryKeys.animal(id),
    queryFn: () => apiClient.getAnimal(id),
    enabled: !!id,
  });
};

// Devices
export const useDevices = (filters?: { farmId?: string; houseId?: string }) => {
  return useQuery({
    queryKey: queryKeys.devices(filters),
    queryFn: () => apiClient.getDevices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDevice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.device(id),
    queryFn: () => apiClient.getDevice(id),
    enabled: !!id,
  });
};

// Sensor Readings
export const useSensorReadings = (filters?: {
  deviceId?: string;
  farmId?: string;
  houseId?: string;
  sensorType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.sensorReadings(filters),
    queryFn: () => apiClient.getSensorReadings(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Device Health
export const useDeviceHealth = (filters?: { deviceId?: string }) => {
  return useQuery({
    queryKey: queryKeys.deviceHealth(filters),
    queryFn: () => apiClient.getDeviceHealth(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useOfflineDevices = (thresholdMinutes?: number) => {
  return useQuery({
    queryKey: ['offline-devices', thresholdMinutes],
    queryFn: () => apiClient.getOfflineDevices(thresholdMinutes),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Performance Metrics
export const usePerformanceMetrics = (filters?: {
  farmId?: string;
  animalId?: string;
  metric?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.performanceMetrics(filters),
    queryFn: () => apiClient.getPerformanceMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Health Records
export const useHealthRecords = (filters?: {
  farmId?: string;
  animalId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.healthRecords(filters),
    queryFn: () => apiClient.getHealthRecords(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: () => apiClient.getCustomers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: queryKeys.customer(id),
    queryFn: () => apiClient.getCustomer(id),
    enabled: !!id,
  });
};

// Dashboard
export const useDashboardMetrics = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics(filters),
    queryFn: () => apiClient.getDashboardMetrics(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: () => apiClient.getDashboardSummary(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      apiClient.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer(id) });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
  });
};

// Utility hooks
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
};

export const usePrefetchFarmData = () => {
  const queryClient = useQueryClient();
  
  return (farmId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.animals({ farmId }),
      queryFn: () => apiClient.getAnimals({ farmId }),
    });
    queryClient.prefetchQuery({
      queryKey: queryKeys.devices({ farmId }),
      queryFn: () => apiClient.getDevices({ farmId }),
    });
  };
};

