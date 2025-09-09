import { prisma } from '../lib/prisma';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerResponse,
} from '../schemas/auth.schemas';

export class CustomerService {
  async createCustomer(data: CreateCustomerInput, createdById: string): Promise<CustomerResponse> {
    // Check if customer with email already exists
    if (data.email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existingCustomer) {
        throw new Error('Customer with this email already exists');
      }
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        ...data,
        createdById,
      },
    });

    return this.formatCustomerResponse(customer);
  }

  async getCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ customers: CustomerResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers: customers.map(this.formatCustomerResponse),
      total,
      page,
      limit,
    };
  }

  async getCustomerById(id: string): Promise<CustomerResponse | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    return customer ? this.formatCustomerResponse(customer) : null;
  }

  async updateCustomer(id: string, data: UpdateCustomerInput): Promise<CustomerResponse> {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error('Customer with this email already exists');
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    return this.formatCustomerResponse(customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id },
    });
  }

  private formatCustomerResponse(customer: any): CustomerResponse {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      createdById: customer.createdById,
    };
  }
}

