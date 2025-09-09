import { prisma } from '../lib/prisma';
import {
  CreatePlanInput,
  UpdatePlanInput,
  PlanResponse,
  PaginationQuery,
} from '../schemas/customer.schemas';

export class PlanService {
  async createPlan(data: CreatePlanInput): Promise<PlanResponse> {
    // Check if plan with name already exists
    const existingPlan = await prisma.plan.findFirst({
      where: { name: data.name },
    });

    if (existingPlan) {
      throw new Error('Plan with this name already exists');
    }

    // Create plan
    const plan = await prisma.plan.create({
      data,
    });

    return this.formatPlanResponse(plan);
  }

  async getPlans(
    pagination: PaginationQuery
  ): Promise<{ plans: PlanResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.plan.count({ where }),
    ]);

    return {
      plans: plans.map(this.formatPlanResponse),
      total,
      page,
      limit,
    };
  }

  async getPlanById(id: string): Promise<PlanResponse | null> {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    return plan ? this.formatPlanResponse(plan) : null;
  }

  async updatePlan(id: string, data: UpdatePlanInput): Promise<PlanResponse> {
    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new Error('Plan not found');
    }

    // Check if name is being changed and if it already exists
    if (data.name && data.name !== existingPlan.name) {
      const nameExists = await prisma.plan.findFirst({
        where: { name: data.name },
      });

      if (nameExists) {
        throw new Error('Plan with this name already exists');
      }
    }

    // Update plan
    const plan = await prisma.plan.update({
      where: { id },
      data,
    });

    return this.formatPlanResponse(plan);
  }

  async deletePlan(id: string): Promise<void> {
    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    // Soft delete by setting isActive to false
    await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private formatPlanResponse(plan: any): PlanResponse {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      currency: plan.currency,
      duration: plan.duration,
      features: plan.features,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}

