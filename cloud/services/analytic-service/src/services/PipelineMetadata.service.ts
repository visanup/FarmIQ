// File: src/services/analytics/PipelineMetadata.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { PipelineMetadata } from '../models/PipelineMetadata.model';

export class PipelineMetadataService {
  private repo: Repository<PipelineMetadata>;

  constructor() {
    this.repo = AppDataSource.getRepository(PipelineMetadata);
  }

  async start(run: Partial<PipelineMetadata>): Promise<PipelineMetadata> {
    const entry = this.repo.create(run);
    return this.repo.save(entry);
  }

  async finish(runId: string, updates: Partial<PipelineMetadata>): Promise<PipelineMetadata | null> {
    const entry = await this.repo.findOneBy({ runId });
    if (!entry) return null;
    Object.assign(entry, updates);
    return this.repo.save(entry);
  }

  async getById(runId: string): Promise<PipelineMetadata | null> {
    return this.repo.findOneBy({ runId });
  }
}