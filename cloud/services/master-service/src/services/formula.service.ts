import prisma from '../lib/prisma';
import { kafkaPublisher } from '../utils/kafka';

export interface CreateFormulaData {
  name: string;
  description?: string;
  composition?: Record<string, any>;
  energy?: number;
  cost?: number;
  meta?: Record<string, any>;
}

export interface UpdateFormulaData {
  name?: string;
  description?: string;
  composition?: Record<string, any>;
  energy?: number;
  cost?: number;
  meta?: Record<string, any>;
}

export interface FormulaFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export class FormulaService {
  async getAllFormulas(filters: FormulaFilters = {}) {
    const { page = 1, limit = 10, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [formulas, total] = await Promise.all([
      prisma.formula.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.formula.count({ where })
    ]);

    return {
      success: true,
      data: formulas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getFormulaById(id: string) {
    const formula = await prisma.formula.findUnique({
      where: { id }
    });

    if (!formula) {
      throw new Error('Formula not found');
    }

    return {
      success: true,
      data: formula
    };
  }

  async createFormula(data: CreateFormulaData) {
    // Check if formula with this name already exists
    const existingFormula = await prisma.formula.findFirst({
      where: { name: data.name }
    });

    if (existingFormula) {
      throw new Error('A formula with this name already exists');
    }

    const formula = await prisma.formula.create({
      data: {
        name: data.name,
        description: data.description,
        composition: data.composition || {},
        energy: data.energy,
        cost: data.cost,
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('formula.snapshot.created', {
        id: formula.id,
        name: formula.name,
        description: formula.description,
        composition: formula.composition,
        energy: formula.energy,
        cost: formula.cost,
        meta: formula.meta,
        createdAt: formula.createdAt,
        updatedAt: formula.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish formula event:', kafkaError);
    }

    return {
      success: true,
      data: formula,
      message: 'Formula created successfully'
    };
  }

  async updateFormula(id: string, data: UpdateFormulaData) {
    const existingFormula = await this.getFormulaById(id);
    if (!existingFormula.data) {
      throw new Error('Formula not found');
    }

    const formula = await prisma.formula.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('formula.snapshot.updated', {
        id: formula.id,
        name: formula.name,
        description: formula.description,
        composition: formula.composition,
        energy: formula.energy,
        cost: formula.cost,
        meta: formula.meta,
        createdAt: formula.createdAt,
        updatedAt: formula.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish formula event:', kafkaError);
    }

    return {
      success: true,
      data: formula,
      message: 'Formula updated successfully'
    };
  }

  async deleteFormula(id: string) {
    const existingFormula = await this.getFormulaById(id);
    if (!existingFormula.data) {
      throw new Error('Formula not found');
    }

    await prisma.formula.delete({
      where: { id }
    });

    // Publish Kafka event
    try {
      await kafkaPublisher.publish('formula.snapshot.deleted', {
        id: existingFormula.data.id,
        name: existingFormula.data.name,
        description: existingFormula.data.description,
        composition: existingFormula.data.composition,
        energy: existingFormula.data.energy,
        cost: existingFormula.data.cost,
        meta: existingFormula.data.meta,
        createdAt: existingFormula.data.createdAt,
        updatedAt: existingFormula.data.updatedAt
      });
    } catch (kafkaError) {
      console.error('Failed to publish formula event:', kafkaError);
    }

    return {
      success: true,
      message: 'Formula deleted successfully'
    };
  }
}
