import { prisma } from '../lib/prisma';
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionResponse,
  PaginationQuery,
} from '../schemas/customer.schemas';

export class SubscriptionService {
  async createSubscription(data: CreateSubscriptionInput, createdById: string): Promise<SubscriptionResponse> {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if customer already has an active subscription for this plan
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        customerId: data.customerId,
        planId: data.planId,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      throw new Error('Customer already has an active subscription for this plan');
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdById,
      },
    });

    return this.formatSubscriptionResponse(subscription);
  }

  async getSubscriptions(
    pagination: PaginationQuery,
    customerId?: string
  ): Promise<{ subscriptions: SubscriptionResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' as const } } },
          { plan: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          plan: true,
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map(this.formatSubscriptionResponse),
      total,
      page,
      limit,
    };
  }

  async getSubscriptionById(id: string): Promise<SubscriptionResponse | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
      },
    });

    return subscription ? this.formatSubscriptionResponse(subscription) : null;
  }

  async updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<SubscriptionResponse> {
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      throw new Error('Subscription not found');
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return this.formatSubscriptionResponse(subscription);
  }

  async cancelSubscription(id: string): Promise<SubscriptionResponse> {
    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'CANCELLED') {
      throw new Error('Subscription is already cancelled');
    }

    // Cancel subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
      },
    });

    return this.formatSubscriptionResponse(updatedSubscription);
  }

  private formatSubscriptionResponse(subscription: any): SubscriptionResponse {
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      createdById: subscription.createdById,
    };
  }
}

