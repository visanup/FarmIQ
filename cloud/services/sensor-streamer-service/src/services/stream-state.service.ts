import { PrismaClient, Prisma } from '@prisma/client';
import { CreateStreamStateInput, UpdateStreamStateInput, StreamStateResponse } from '../types/stream-state.types';
import { KafkaService } from './kafka.service';

const prisma = new PrismaClient();
const kafkaService = new KafkaService();

export class StreamStateService {
  async createOrUpdateStreamState(data: CreateStreamStateInput): Promise<StreamStateResponse> {
    const streamState = await prisma.streamState.upsert({
      where: { deviceId: data.deviceId },
      update: {
        streamType: data.streamType as any,
        isActive: data.isActive ?? true,
        lastProcessedAt: data.lastProcessedAt ? new Date(data.lastProcessedAt) : null,
        lastError: data.lastError ?? null,
        retryCount: data.retryCount ?? 0,
        config: data.config ? data.config : Prisma.JsonNull,
      },
      create: {
        deviceId: data.deviceId,
        streamType: data.streamType as any,
        isActive: data.isActive ?? true,
        lastProcessedAt: data.lastProcessedAt ? new Date(data.lastProcessedAt) : null,
        lastError: data.lastError ?? null,
        retryCount: data.retryCount ?? 0,
        config: data.config ? data.config : Prisma.JsonNull,
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishStreamState(streamState);
    } catch (error) {
      console.error('Failed to publish stream state to Kafka:', error);
    }

    return this.formatStreamStateResponse(streamState);
  }

  async getStreamStateByDeviceId(deviceId: string): Promise<StreamStateResponse | null> {
    const streamState = await prisma.streamState.findUnique({
      where: { deviceId },
    });

    if (!streamState) {
      return null;
    }

    return this.formatStreamStateResponse(streamState);
  }

  async getStreamStates(
    page: number = 1,
    limit: number = 10,
    deviceId?: string,
    streamType?: string,
    isActive?: boolean
  ): Promise<{ states: StreamStateResponse[]; total: number; page: number; limit: number }> {
    const where: Prisma.StreamStateWhereInput = {};
    
    if (deviceId) where.deviceId = deviceId;
    if (streamType) where.streamType = streamType as any;
    if (isActive !== undefined) where.isActive = isActive;

    const [states, total] = await Promise.all([
      prisma.streamState.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.streamState.count({ where }),
    ]);

    return {
      states: states.map(this.formatStreamStateResponse),
      total,
      page,
      limit,
    };
  }

  async updateStreamState(id: string, data: UpdateStreamStateInput): Promise<StreamStateResponse> {
    const streamState = await prisma.streamState.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.lastProcessedAt !== undefined && { lastProcessedAt: data.lastProcessedAt ? new Date(data.lastProcessedAt) : null }),
        ...(data.lastError !== undefined && { lastError: data.lastError }),
        ...(data.retryCount !== undefined && { retryCount: data.retryCount }),
        ...(data.config !== undefined && { config: data.config ? data.config : Prisma.JsonNull }),
      },
    });

    // Send to Kafka
    try {
      await kafkaService.publishStreamState(streamState);
    } catch (error) {
      console.error('Failed to publish stream state to Kafka:', error);
    }

    return this.formatStreamStateResponse(streamState);
  }

  async deleteStreamState(id: string): Promise<void> {
    await prisma.streamState.delete({
      where: { id },
    });
  }

  async getActiveStreamStates(): Promise<StreamStateResponse[]> {
    const states = await prisma.streamState.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    return states.map(this.formatStreamStateResponse);
  }

  private formatStreamStateResponse(state: any): StreamStateResponse {
    return {
      id: state.id,
      deviceId: state.deviceId,
      streamType: state.streamType,
      isActive: state.isActive,
      lastProcessedAt: state.lastProcessedAt,
      lastError: state.lastError,
      retryCount: state.retryCount,
      config: state.config,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}
