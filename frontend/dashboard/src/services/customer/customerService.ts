import { apiClient } from '../api/client';

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

class CustomerService {
  private DEMO_CUSTOMERS: Customer[] = [
    { customer_id: 'cus_001', name: 'Global AgriCorp', email: 'contact@globalagricorp.com', phone: '+1-202-555-0176', address: '123 Agriculture Ave, Food Valley, CA 94043', status: 'active', created_at: '2023-01-15T09:30:00Z', updated_at: '2023-10-28T14:00:00Z' },
    { customer_id: 'cus_002', name: 'Greenfield Farms Ltd.', email: 'support@greenfield.io', phone: '+44 20 7946 0958', address: 'The Old Barn, Greenfield, GL51 4TF, UK', status: 'active', created_at: '2023-02-20T11:00:00Z', updated_at: '2023-11-15T10:20:00Z' },
    { customer_id: 'cus_003', name: 'Sunrise Dairy', email: 'hello@sunrisedairy.com', phone: '+1-315-555-0129', address: '456 Dairy Lane, Watertown, NY 13601', status: 'inactive', created_at: '2023-03-10T15:45:00Z', updated_at: '2023-09-22T18:00:00Z' },
    { customer_id: 'cus_004', name: 'AquaPonics Innovators', email: 'info@aquapinnovate.com', phone: '+1-512-555-0182', address: '789 Hydro Rd, Austin, TX 78701', status: 'pending', created_at: '2023-05-05T18:00:00Z', updated_at: '2023-05-05T18:00:00Z' },
  ];
  
  async getCustomers(): Promise<Customer[]> {
    // try {
    //   return await apiClient.get<Customer[]>('/customers');
    // } catch (error) {
    //   console.error("Failed to fetch customers from API, returning demo data.", error);
    //   return this.DEMO_CUSTOMERS;
    // }
    console.warn('Using mock data for getCustomers');
    return Promise.resolve(this.DEMO_CUSTOMERS);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
     console.warn('Using mock data for getCustomer');
     return Promise.resolve(this.DEMO_CUSTOMERS.find(c => c.customer_id === id));
  }

  async createCustomer(customerData: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    console.warn('Using mock data for createCustomer');
    const newCustomer: Customer = {
        ...customerData,
        customer_id: `cus_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    this.DEMO_CUSTOMERS.push(newCustomer);
    return Promise.resolve(newCustomer);
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | undefined> {
    console.warn('Using mock data for updateCustomer');
    const index = this.DEMO_CUSTOMERS.findIndex(c => c.customer_id === id);
    if (index > -1) {
        this.DEMO_CUSTOMERS[index] = { ...this.DEMO_CUSTOMERS[index], ...customerData, updated_at: new Date().toISOString() };
        return Promise.resolve(this.DEMO_CUSTOMERS[index]);
    }
    return Promise.resolve(undefined);
  }

  async deleteCustomer(id: string): Promise<void> {
    console.warn('Using mock data for deleteCustomer');
    this.DEMO_CUSTOMERS = this.DEMO_CUSTOMERS.filter(c => c.customer_id !== id);
    return Promise.resolve();
  }
}

export const customerService = new CustomerService();
