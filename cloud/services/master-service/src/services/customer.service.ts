import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';
import { 
  Customer, 
  CustomerWithFarms, 
  CreateCustomerRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

export class CustomerService {
  async createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    try {
      // Use upsert to handle existing customers gracefully
      const customer = await prisma.customer.upsert({
        where: { tenantId: data.tenantId },
        update: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          meta: data.meta || {},
          updatedAt: new Date()
        },
        create: {
          tenantId: data.tenantId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          meta: data.meta || {}
        }
      });

      // Publish Kafka event
      try {
        const eventType = customer.createdAt.getTime() === customer.updatedAt.getTime() 
          ? 'customer.snapshot.created' 
          : 'customer.snapshot.updated';
        await kafkaPublisher.publishCustomerSnapshot(eventType, customer);
      } catch (kafkaError) {
        console.error('Failed to publish customer event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      const message = customer.createdAt.getTime() === customer.updatedAt.getTime() 
        ? 'Customer created successfully'
        : 'Customer updated successfully';

      return {
        success: true,
        data: customer,
        message
      };
    } catch (error) {
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<ApiResponse<CustomerWithFarms>> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          farms: {
            include: {
              houses: true,
              flocks: true
            }
          }
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return {
        success: true,
        data: customer
      };
    } catch (error) {
      throw error;
    }
  }

  async getCustomerByTenantId(tenantId: string): Promise<ApiResponse<CustomerWithFarms>> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { tenantId },
        include: {
          farms: {
            include: {
              houses: true,
              flocks: true
            }
          }
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return {
        success: true,
        data: customer
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResponse<Customer>> {
    try {
      const skip = (page - 1) * limit;
      
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count()
      ]);

      return {
        success: true,
        data: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(
    id: string, 
    data: Partial<CreateCustomerRequest>
  ): Promise<ApiResponse<Customer>> {
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Publish Kafka event
      try {
        await kafkaPublisher.publishCustomerSnapshot('customer.snapshot.updated', customer);
      } catch (kafkaError) {
        console.error('Failed to publish customer update event:', kafkaError);
        // Don't fail the request if Kafka fails
      }

      return {
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    try {
      await prisma.customer.delete({
        where: { id }
      });

      return {
        success: true,
        data: null,
        message: 'Customer deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}
