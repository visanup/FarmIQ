// src/services/feedBatches.service.ts
import { Repository } from 'typeorm';
import { FeedBatch } from '../models/feedBatch.model';
import { publishEvent } from '../kafka/producer';
import { FEED_BATCHES_TOPIC, FeedBatchesEvents } from '../kafka/topics';

export class FeedBatchesService {
  constructor(private repo: Repository<FeedBatch>) {}

  async create(data: Partial<FeedBatch>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish created event
    await publishEvent(
      FEED_BATCHES_TOPIC,
      FeedBatchesEvents.Created,
      saved
    );
    return saved;
  }

  async findAll() {
    return await this.repo.find();
  }

  async findById(productionDate: Date, feedBatchId: number) {
    return await this.repo.findOneBy({ productionDate, feedBatchId });
  }

  async update(
    productionDate: Date,
    feedBatchId: number,
    data: Partial<FeedBatch>
  ) {
    await this.repo.update({ productionDate, feedBatchId }, data);
    const updated = await this.findById(productionDate, feedBatchId);
    if (updated) {
      await publishEvent(
        FEED_BATCHES_TOPIC,
        FeedBatchesEvents.Updated,
        updated
      );
    }
    return updated;
  }

  async delete(productionDate: Date, feedBatchId: number) {
    const toDelete = await this.findById(productionDate, feedBatchId);
    const result = await this.repo.delete({ productionDate, feedBatchId });
    if (toDelete) {
      await publishEvent(
        FEED_BATCHES_TOPIC,
        FeedBatchesEvents.Deleted,
        toDelete
      );
    }
    return result;
  }
}
