import { PrismaClient, Prisma } from '@prisma/client';
import { CreateDataIngestionLogInput, DataIngestionLogResponse } from '../types/data-ingestion-log.types';

const prisma = new PrismaClient();

export class DataIngestionLogService {
  async createDataIngestionLog(data: CreateDataIngestionLogInput): Promise<DataIngestionLogResponse> {
    const log = await prisma.dataIngestionLog.create({
      data: {
        source: data.source,
        dataType: data.dataType,
        recordCount: data.recordCount,
        status: data.status,
        errorMessage: data.errorMessage || null,
        metadata: data.metadata ? data.metadata : Prisma.JsonNull,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });

    return this.formatDataIngestionLogResponse(log);
  }

  async getDataIngestionLogById(id: string): Promise<DataIngestionLogResponse | null> {
    const log = await prisma.dataIngestionLog.findUnique({
      where: { id },
    });

    if (!log) {
      return null;
    }

    return this.formatDataIngestionLogResponse(log);
  }

  async getDataIngestionLogs(
    page: number = 1,
    limit: number = 10,
    source?: string,
    dataType?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ logs: DataIngestionLogResponse[]; total: number; page: number; limit: number }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const where: Prisma.DataIngestionLogWhereInput = {};
    
    if (source) {
      where.source = source;
    }
    
    if (dataType) {
      where.dataType = dataType;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.dataIngestionLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.dataIngestionLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => this.formatDataIngestionLogResponse(log)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  // Alias for createDataIngestionLog
  async createLog(data: CreateDataIngestionLogInput): Promise<DataIngestionLogResponse> {
    return this.createDataIngestionLog(data);
  }

  // Alias for getDataIngestionLogs with recent filter
  async getRecentLogs(limit: number = 10): Promise<DataIngestionLogResponse[]> {
    const result = await this.getDataIngestionLogs(1, limit);
    return result.logs;
  }

  // Alias for getDataIngestionLogs with source filter
  async getLogsBySource(source: string, page: number = 1, limit: number = 10): Promise<{ logs: DataIngestionLogResponse[]; total: number; page: number; limit: number }> {
    return this.getDataIngestionLogs(page, limit, source);
  }

  // Alias for getDataIngestionLogs with dataType filter
  async getLogsByDataType(dataType: string, page: number = 1, limit: number = 10): Promise<{ logs: DataIngestionLogResponse[]; total: number; page: number; limit: number }> {
    return this.getDataIngestionLogs(page, limit, undefined, dataType);
  }

  private formatDataIngestionLogResponse(log: any): DataIngestionLogResponse {
    return {
      id: log.id,
      source: log.source,
      dataType: log.dataType,
      recordCount: log.recordCount,
      status: log.status,
      errorMessage: log.errorMessage,
      metadata: log.metadata,
      timestamp: log.timestamp,
    };
  }
}