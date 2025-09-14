import { PrismaClient } from '@prisma/client';
import { kafkaPublisher } from '../utils/kafka';

const prisma = new PrismaClient();

export interface CreateSensorTypeData {
  name: string;
  unit?: string;
  dataType?: string;
  range?: any;
  description?: string;
  meta?: any;
}

export interface UpdateSensorTypeData {
  name?: string;
  unit?: string;
  dataType?: string;
  range?: any;
  description?: string;
  meta?: any;
}

export class SensorTypeService {
  async getAllSensorTypes() {
    return await prisma.sensorType.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSensorTypeById(id: string) {
    return await prisma.sensorType.findUnique({
      where: { id }
    });
  }

  async getSensorTypeByName(name: string) {
    return await prisma.sensorType.findUnique({
      where: { name }
    });
  }

  async createSensorType(data: CreateSensorTypeData) {
    // Check if sensor type with this name already exists
    const existingSensorType = await this.getSensorTypeByName(data.name);
    if (existingSensorType) {
      throw new Error('A sensor type with this name already exists');
    }

    const sensorType = await prisma.sensorType.create({
      data: {
        name: data.name,
        unit: data.unit,
        dataType: data.dataType,
        range: data.range || {},
        description: data.description,
        meta: data.meta || {}
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('sensorType.snapshot.created', {
      id: sensorType.id,
      name: sensorType.name,
      unit: sensorType.unit,
      dataType: sensorType.dataType,
      range: sensorType.range,
      description: sensorType.description,
      meta: sensorType.meta,
      createdAt: sensorType.createdAt,
      updatedAt: sensorType.updatedAt
    });

    return sensorType;
  }

  async updateSensorType(id: string, data: UpdateSensorTypeData) {
    const existingSensorType = await this.getSensorTypeById(id);
    if (!existingSensorType) {
      throw new Error('Sensor type not found');
    }

    // Check if name is being changed and if new name already exists
    if (data.name && data.name !== existingSensorType.name) {
      const nameExists = await this.getSensorTypeByName(data.name);
      if (nameExists) {
        throw new Error('A sensor type with this name already exists');
      }
    }

    const sensorType = await prisma.sensorType.update({
      where: { id },
      data: {
        ...data,
        meta: data.meta || existingSensorType.meta
      }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('sensorType.snapshot.updated', {
      id: sensorType.id,
      name: sensorType.name,
      unit: sensorType.unit,
      dataType: sensorType.dataType,
      range: sensorType.range,
      description: sensorType.description,
      meta: sensorType.meta,
      createdAt: sensorType.createdAt,
      updatedAt: sensorType.updatedAt
    });

    return sensorType;
  }

  async deleteSensorType(id: string) {
    const existingSensorType = await this.getSensorTypeById(id);
    if (!existingSensorType) {
      throw new Error('Sensor type not found');
    }

    await prisma.sensorType.delete({
      where: { id }
    });

    // Publish Kafka event
    await kafkaPublisher.publish('sensorType.snapshot.deleted', {
      id: existingSensorType.id,
      name: existingSensorType.name,
      unit: existingSensorType.unit,
      dataType: existingSensorType.dataType,
      range: existingSensorType.range,
      description: existingSensorType.description,
      meta: existingSensorType.meta,
      createdAt: existingSensorType.createdAt,
      updatedAt: existingSensorType.updatedAt
    });

    return { success: true, message: 'Sensor type deleted successfully' };
  }

  async clearAllSensorTypes() {
    const count = await prisma.sensorType.count();
    await prisma.sensorType.deleteMany();
    return { success: true, message: `Deleted ${count} sensor types` };
  }
}


