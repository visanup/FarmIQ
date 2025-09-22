// Custom hook for Master Service data
import { useState, useEffect, useCallback } from 'react';
import { masterServiceClient } from '../services/api';
import { Farm, Device, Animal, Customer, House } from '../types/api';

export interface UseMasterDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMasterData(options: UseMasterDataOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Farms
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmsLoading, setFarmsLoading] = useState(false);

  // Devices
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  // Animals
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);

  // Houses
  const [houses, setHouses] = useState<House[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setError(null);
    try {
      const data = await masterServiceClient.getCustomers();
      setCustomers(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // Fetch farms
  const fetchFarms = useCallback(async () => {
    setFarmsLoading(true);
    setError(null);
    try {
      const data = await masterServiceClient.getFarms();
      setFarms(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch farms');
    } finally {
      setFarmsLoading(false);
    }
  }, []);

  // Fetch devices
  const fetchDevices = useCallback(async (filters?: { farmId?: string; houseId?: string }) => {
    setDevicesLoading(true);
    setError(null);
    try {
      const data = await masterServiceClient.getDevices(filters);
      setDevices(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  // Fetch animals
  const fetchAnimals = useCallback(async (filters?: { farmId?: string; houseId?: string }) => {
    setAnimalsLoading(true);
    setError(null);
    try {
      const data = await masterServiceClient.getAnimals(filters);
      setAnimals(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animals');
    } finally {
      setAnimalsLoading(false);
    }
  }, []);

  // Fetch houses
  const fetchHouses = useCallback(async (farmId?: string) => {
    setHousesLoading(true);
    setError(null);
    try {
      const data = await masterServiceClient.getHouses(farmId);
      setHouses(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch houses');
    } finally {
      setHousesLoading(false);
    }
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchCustomers(),
        fetchFarms(),
        fetchDevices(),
        fetchAnimals(),
        fetchHouses(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, fetchFarms, fetchDevices, fetchAnimals, fetchHouses]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAll, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAll]);

  // Computed values
  const totalCustomers = customers.length;
  const totalFarms = farms.length;
  const totalDevices = devices.length;
  const totalAnimals = animals.length;
  const totalHouses = houses.length;

  const activeFarms = farms.filter(farm => farm.isActive).length;
  const activeDevices = devices.filter(device => device.isActive).length;
  const activeAnimals = animals.filter(animal => animal.isActive).length;

  return {
    // Data
    customers,
    farms,
    devices,
    animals,
    houses,
    
    // Loading states
    loading,
    customersLoading,
    farmsLoading,
    devicesLoading,
    animalsLoading,
    housesLoading,
    
    // Error state
    error,
    
    // Metadata
    lastUpdate,
    totalCustomers,
    totalFarms,
    totalDevices,
    totalAnimals,
    totalHouses,
    activeFarms,
    activeDevices,
    activeAnimals,
    
    // Actions
    fetchCustomers,
    fetchFarms,
    fetchDevices,
    fetchAnimals,
    fetchHouses,
    fetchAll,
    
    // Refresh
    refresh: fetchAll,
  };
}
