// Customer Data Filtering Utility Hook
import { useState, useEffect } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

interface WithCustomerId {
  customerId: number;
}

/**
 * Custom hook for filtering data based on current customer
 * @param allData - Array of data items with customerId property
 * @returns Filtered data based on customer context
 */
export const useCustomerFilter = <T extends WithCustomerId>(allData: T[]): {
  filteredData: T[];
  hasAccess: boolean;
  isLoading: boolean;
} => {
  const { state } = useDashboard();
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    if (state.isAdmin) {
      // Admin can see all data
      setFilteredData(allData);
      setHasAccess(true);
    } else if (state.currentCustomer) {
      // Regular customer sees only their data
      const customerData = allData.filter(item => item.customerId === state.currentCustomer?.id);
      setFilteredData(customerData);
      setHasAccess(true);
    } else {
      // No access
      setFilteredData([]);
      setHasAccess(false);
    }
    
    setIsLoading(false);
  }, [state.currentCustomer, state.isAdmin, allData]);

  return { filteredData, hasAccess, isLoading };
};

/**
 * Check if user has access to customer data
 */
export const useCustomerAccess = () => {
  const { state } = useDashboard();
  
  return {
    hasAccess: state.isAdmin || !!state.currentCustomer,
    isAdmin: state.isAdmin,
    currentCustomer: state.currentCustomer,
    customerName: state.currentCustomer?.name || 'Unknown',
  };
};

export default useCustomerFilter;