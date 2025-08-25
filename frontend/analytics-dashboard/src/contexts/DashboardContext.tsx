// Dashboard Context for Customer-Specific Data Filtering
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { format, subDays } from 'date-fns';

// Types for dashboard state management
export interface Customer {
  id: number;
  name: string;
  email: string;
  subscription_status: 'active' | 'inactive' | 'trial';
  plan_code: string;
  created_at: string;
}

export interface Farm {
  id: string;
  name: string;
  customerId: number;
  penCount: number;
  location?: string;
  farmType: 'aquaculture' | 'livestock' | 'mixed';
}

export interface Pen {
  id: string;
  name: string;
  farmId: string;
  capacity: number;
  currentStock: number;
  animalType: string;
}

export interface DashboardFilters {
  customerId?: number;
  farmId?: string;
  penId?: string;
  level: 'overview' | 'farm' | 'pen';
  dateRange: {
    start: string;
    end: string;
  };
  interval: 'hourly' | 'daily' | 'weekly';
}

export interface DashboardState {
  // Authentication and customer data
  currentCustomer: Customer | null;
  isAdmin: boolean;
  
  // Available data
  customers: Customer[];
  farms: Farm[];
  pens: Pen[];
  
  // Current filters
  filters: DashboardFilters;
  
  // Loading states
  loading: {
    customers: boolean;
    farms: boolean;
    pens: boolean;
    performance: boolean;
    weight: boolean;
    sensors: boolean;
  };
  
  // Error states
  errors: {
    customers: string | null;
    farms: string | null;
    pens: string | null;
    performance: string | null;
    weight: string | null;
    sensors: string | null;
  };
  
  // Data refresh timestamps
  lastUpdated: {
    performance: string | null;
    weight: string | null;
    sensors: string | null;
  };
}

// Action types
type DashboardAction =
  | { type: 'SET_CURRENT_CUSTOMER'; payload: Customer | null }
  | { type: 'SET_IS_ADMIN'; payload: boolean }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_FARMS'; payload: Farm[] }
  | { type: 'SET_PENS'; payload: Pen[] }
  | { type: 'UPDATE_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_LOADING'; payload: { key: keyof DashboardState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof DashboardState['errors']; value: string | null } }
  | { type: 'UPDATE_LAST_UPDATED'; payload: { key: keyof DashboardState['lastUpdated']; value: string } }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: DashboardState = {
  currentCustomer: null,
  isAdmin: false,
  customers: [],
  farms: [],
  pens: [],
  filters: {
    level: 'overview',
    dateRange: {
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    interval: 'daily'
  },
  loading: {
    customers: false,
    farms: false,
    pens: false,
    performance: false,
    weight: false,
    sensors: false
  },
  errors: {
    customers: null,
    farms: null,
    pens: null,
    performance: null,
    weight: null,
    sensors: null
  },
  lastUpdated: {
    performance: null,
    weight: null,
    sensors: null
  }
};

// Reducer function
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_CURRENT_CUSTOMER':
      return {
        ...state,
        currentCustomer: action.payload,
        filters: {
          ...state.filters,
          customerId: action.payload?.id,
          farmId: undefined,
          penId: undefined,
          level: 'overview'
        }
      };
      
    case 'SET_IS_ADMIN':
      return { ...state, isAdmin: action.payload };
      
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
      
    case 'SET_FARMS':
      return { ...state, farms: action.payload };
      
    case 'SET_PENS':
      return { ...state, pens: action.payload };
      
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      };
      
    case 'UPDATE_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: { ...state.lastUpdated, [action.payload.key]: action.payload.value }
      };
      
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          ...initialState.filters,
          customerId: state.currentCustomer?.id
        }
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

// Context creation
const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  // Helper functions
  setCurrentCustomer: (customer: Customer | null) => void;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  setLevel: (level: 'overview' | 'farm' | 'pen', farmId?: string, penId?: string) => void;
  setDateRange: (start: string, end: string) => void;
  setLoading: (key: keyof DashboardState['loading'], value: boolean) => void;
  setError: (key: keyof DashboardState['errors'], value: string | null) => void;
  refreshData: () => void;
  getAvailableFarms: () => Farm[];
  getAvailablePens: (farmId?: string) => Pen[];
  isDataStale: (dataType: keyof DashboardState['lastUpdated'], maxAgeMinutes?: number) => boolean;
} | undefined>(undefined);

// Hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Helper functions
  const setCurrentCustomer = (customer: Customer | null) => {
    dispatch({ type: 'SET_CURRENT_CUSTOMER', payload: customer });
  };

  const updateFilters = (filters: Partial<DashboardFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const setLevel = (level: 'overview' | 'farm' | 'pen', farmId?: string, penId?: string) => {
    const newFilters: Partial<DashboardFilters> = { level };
    
    if (level === 'farm' && farmId) {
      newFilters.farmId = farmId;
      newFilters.penId = undefined;
    } else if (level === 'pen' && farmId && penId) {
      newFilters.farmId = farmId;
      newFilters.penId = penId;
    } else if (level === 'overview') {
      newFilters.farmId = undefined;
      newFilters.penId = undefined;
    }
    
    dispatch({ type: 'UPDATE_FILTERS', payload: newFilters });
  };

  const setDateRange = (start: string, end: string) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: { dateRange: { start, end } } });
  };

  const setLoading = (key: keyof DashboardState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  };

  const setError = (key: keyof DashboardState['errors'], value: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  };

  const refreshData = () => {
    // Reset all errors
    Object.keys(state.errors).forEach(key => {
      setError(key as keyof DashboardState['errors'], null);
    });
    
    // Update timestamps
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: 'performance', value: now } });
    dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: 'weight', value: now } });
    dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: 'sensors', value: now } });
  };

  const getAvailableFarms = (): Farm[] => {
    if (state.isAdmin) {
      return state.farms;
    }
    return state.farms.filter(farm => farm.customerId === state.currentCustomer?.id);
  };

  const getAvailablePens = (farmId?: string): Pen[] => {
    const targetFarmId = farmId || state.filters.farmId;
    if (!targetFarmId) return [];
    
    return state.pens.filter(pen => pen.farmId === targetFarmId);
  };

  const isDataStale = (dataType: keyof DashboardState['lastUpdated'], maxAgeMinutes: number = 5): boolean => {
    const lastUpdated = state.lastUpdated[dataType];
    if (!lastUpdated) return true;
    
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    return diffMinutes > maxAgeMinutes;
  };

  // Initialize dashboard with user data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) return;

        // Parse JWT to get user info (basic implementation)
        const userInfo = JSON.parse(atob(token.split('.')[1]));
        const isAdmin = userInfo.role === 'admin' || userInfo.role === 'super_admin';
        
        dispatch({ type: 'SET_IS_ADMIN', payload: isAdmin });

        if (!isAdmin && userInfo.tenant_id) {
          // For regular customers, set current customer from token
          const customer: Customer = {
            id: userInfo.tenant_id,
            name: userInfo.customer_name || userInfo.name || 'Unknown Customer',
            email: userInfo.email || '',
            subscription_status: 'active',
            plan_code: userInfo.plan_code || 'basic',
            created_at: userInfo.iat ? new Date(userInfo.iat * 1000).toISOString() : new Date().toISOString()
          };
          
          setCurrentCustomer(customer);
        }

        // Load initial data
        if (isAdmin) {
          // Load all customers for admin
          setLoading('customers', true);
          try {
            // This would be replaced with actual API call
            const mockCustomers: Customer[] = [
              {
                id: 1,
                name: 'ฟาร์มแสงอรุณ',
                email: 'contact@sangarun-farm.com',
                subscription_status: 'active',
                plan_code: 'premium',
                created_at: '2024-01-15T00:00:00Z'
              },
              {
                id: 2,
                name: 'ฟาร์มอควาเทค',
                email: 'info@aquatech-farm.com',
                subscription_status: 'active',
                plan_code: 'professional',
                created_at: '2024-02-01T00:00:00Z'
              }
            ];
            dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
          } catch (error) {
            setError('customers', 'ไม่สามารถโหลดข้อมูลลูกค้าได้');
          } finally {
            setLoading('customers', false);
          }
        }

        // Load farms and pens data
        setLoading('farms', true);
        try {
          const mockFarms: Farm[] = [
            { id: 'farm-1', name: 'ฟาร์ม 1', customerId: userInfo.tenant_id || 1, penCount: 5, farmType: 'aquaculture' },
            { id: 'farm-2', name: 'ฟาร์ม 2', customerId: userInfo.tenant_id || 1, penCount: 3, farmType: 'livestock' },
            { id: 'farm-3', name: 'ฟาร์ม 3', customerId: userInfo.tenant_id || 2, penCount: 8, farmType: 'aquaculture' }
          ];
          dispatch({ type: 'SET_FARMS', payload: mockFarms });

          const mockPens: Pen[] = [
            { id: 'pen-farm-1-1', name: 'เล้า 1', farmId: 'farm-1', capacity: 1000, currentStock: 850, animalType: 'ปลานิล' },
            { id: 'pen-farm-1-2', name: 'เล้า 2', farmId: 'farm-1', capacity: 1000, currentStock: 920, animalType: 'ปลานิล' },
            { id: 'pen-farm-1-3', name: 'เล้า 3', farmId: 'farm-1', capacity: 1200, currentStock: 1100, animalType: 'ปลาดุก' },
            { id: 'pen-farm-2-1', name: 'เล้า 1', farmId: 'farm-2', capacity: 50, currentStock: 45, animalType: 'หมู' },
            { id: 'pen-farm-2-2', name: 'เล้า 2', farmId: 'farm-2', capacity: 60, currentStock: 58, animalType: 'ไก่' }
          ];
          dispatch({ type: 'SET_PENS', payload: mockPens });
        } catch (error) {
          setError('farms', 'ไม่สามารถโหลดข้อมูลฟาร์มได้');
        } finally {
          setLoading('farms', false);
          setLoading('pens', false);
        }

      } catch (error) {
        console.error('Error initializing dashboard:', error);
      }
    };

    initializeDashboard();
  }, []);

  const contextValue = {
    state,
    dispatch,
    setCurrentCustomer,
    updateFilters,
    setLevel,
    setDateRange,
    setLoading,
    setError,
    refreshData,
    getAvailableFarms,
    getAvailablePens,
    isDataStale
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;