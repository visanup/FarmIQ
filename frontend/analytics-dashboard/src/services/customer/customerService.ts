// Customer Service API Integration
import axios, { AxiosInstance } from 'axios';

// Types based on your database schema
export interface Customer {
  customer_id: number;
  tenant_id: string;
  external_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_info?: Record<string, any>;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Contact {
  contact_id: number;
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string; // owner, ops, billing
  created_at: string;
  updated_at: string;
}

export interface CustomerUser {
  customer_user_id: number;
  customer_id: number;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface PlanCatalog {
  plan_code: string; // PRO, TEAM, ENTERPRISE
  name: string;
  description?: string;
  entitlements?: Record<string, any>; // {max_devices: 50, alerting: true, ...}
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  subscription_id: number;
  customer_id: number;
  plan_code: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'canceled' | 'expired';
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_info?: Record<string, any>;
}

export interface SubscriptionCreateData {
  customer_id: number;
  plan_code: string;
  start_date: string;
  end_date?: string;
  meta?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  q?: string; // search query
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CustomerService {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_CUSTOMER_API_URL || '/api/customer') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  // Customer Management
  async getCustomers(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const response = await this.client.get('/customers', { params });
    return response.data;
  }

  async getCustomer(customerId: number): Promise<Customer> {
    const response = await this.client.get(`/customers/${customerId}`);
    return response.data;
  }

  async createCustomer(data: CustomerCreateData): Promise<Customer> {
    const response = await this.client.post('/customers', data);
    return response.data;
  }

  async updateCustomer(customerId: number, data: Partial<CustomerCreateData>): Promise<Customer> {
    const response = await this.client.put(`/customers/${customerId}`, data);
    return response.data;
  }

  async deleteCustomer(customerId: number): Promise<void> {
    await this.client.delete(`/customers/${customerId}`);
  }

  // Contact Management
  async getCustomerContacts(customerId: number): Promise<Contact[]> {
    const response = await this.client.get(`/customers/${customerId}/contacts`);
    return response.data;
  }

  async createContact(customerId: number, data: Omit<Contact, 'contact_id' | 'customer_id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const response = await this.client.post(`/customers/${customerId}/contacts`, data);
    return response.data;
  }

  async updateContact(customerId: number, contactId: number, data: Partial<Contact>): Promise<Contact> {
    const response = await this.client.put(`/customers/${customerId}/contacts/${contactId}`, data);
    return response.data;
  }

  async deleteContact(customerId: number, contactId: number): Promise<void> {
    await this.client.delete(`/customers/${customerId}/contacts/${contactId}`);
  }

  // Customer User Management
  async getCustomerUsers(customerId: number): Promise<CustomerUser[]> {
    const response = await this.client.get(`/customers/${customerId}/members`);
    return response.data;
  }

  async addCustomerUser(customerId: number, data: { user_id: string; role: CustomerUser['role'] }): Promise<CustomerUser> {
    const response = await this.client.post(`/customers/${customerId}/members`, data);
    return response.data;
  }

  async updateCustomerUserRole(customerId: number, customerUserId: number, role: CustomerUser['role']): Promise<CustomerUser> {
    const response = await this.client.put(`/customers/${customerId}/members/${customerUserId}`, { role });
    return response.data;
  }

  async removeCustomerUser(customerId: number, customerUserId: number): Promise<void> {
    await this.client.delete(`/customers/${customerId}/members/${customerUserId}`);
  }

  // Plan Management
  async getPlans(): Promise<PlanCatalog[]> {
    const response = await this.client.get('/plans');
    return response.data;
  }

  // Subscription Management
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await this.client.get('/subscriptions');
    return response.data;
  }

  async createSubscription(data: SubscriptionCreateData): Promise<Subscription> {
    const response = await this.client.post('/subscriptions', data);
    return response.data;
  }

  async updateSubscription(subscriptionId: number, data: Partial<SubscriptionCreateData>): Promise<Subscription> {
    const response = await this.client.put(`/subscriptions/${subscriptionId}`, data);
    return response.data;
  }

  async changePlan(subscriptionId: number, planCode: string): Promise<Subscription> {
    const response = await this.client.post(`/subscriptions/${subscriptionId}/change-plan`, { plan_code: planCode });
    return response.data;
  }

  async pauseSubscription(subscriptionId: number): Promise<Subscription> {
    const response = await this.client.post(`/subscriptions/${subscriptionId}/pause`);
    return response.data;
  }

  async resumeSubscription(subscriptionId: number): Promise<Subscription> {
    const response = await this.client.post(`/subscriptions/${subscriptionId}/resume`);
    return response.data;
  }

  async cancelSubscription(subscriptionId: number): Promise<Subscription> {
    const response = await this.client.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  // Dashboard/Analytics
  async getCustomerDashboard(customerId: number): Promise<{
    customer: Customer;
    activeSubscriptions: Subscription[];
    contacts: Contact[];
    users: CustomerUser[];
    billingStatus: {
      currentPlan: string;
      status: string;
      nextBillingDate?: string;
      monthlyUsage?: Record<string, any>;
    };
  }> {
    const [customer, subscriptions, contacts, users] = await Promise.all([
      this.getCustomer(customerId),
      this.getSubscriptions(),
      this.getCustomerContacts(customerId),
      this.getCustomerUsers(customerId)
    ]);

    const activeSubscriptions = subscriptions.filter(s => 
      s.customer_id === customerId && s.status === 'active'
    );

    const currentPlan = activeSubscriptions[0]?.plan_code || 'None';
    const nextBillingDate = activeSubscriptions[0]?.end_date;

    return {
      customer,
      activeSubscriptions,
      contacts,
      users,
      billingStatus: {
        currentPlan,
        status: customer.status,
        nextBillingDate,
        monthlyUsage: {} // This would come from usage tracking service
      }
    };
  }

  // Me endpoint - get current user's customer context
  async getMyCustomerContext(): Promise<{
    customers: Customer[];
    currentCustomer?: Customer;
    role?: string;
  }> {
    const response = await this.client.get('/me');
    return response.data;
  }
}

// Create singleton instance
export const customerService = new CustomerService();
export default CustomerService;