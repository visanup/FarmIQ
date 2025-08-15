// src/services/feedBatchAssignments.service.ts
import { Repository } from 'typeorm';
import { FeedBatchAssignment } from '../models/feedBatchAssignments.model';
import { publishEvent } from '../kafka/producer';
import { FEED_BATCH_ASSIGNMENTS_TOPIC, FeedBatchAssignmentsEvents } from '../kafka/topics';

export class FeedBatchAssignmentsService {
  constructor(private repo: Repository<FeedBatchAssignment>) {}

  async create(data: Partial<FeedBatchAssignment>) {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    // publish assigned event
    await publishEvent(
      FEED_BATCH_ASSIGNMENTS_TOPIC,
      FeedBatchAssignmentsEvents.Assigned,
      saved
    );
    return saved;
  }

  async findAll() {
    return await this.repo.find();
  }

  async findById(id: number) {
    return await this.repo.findOneBy({ assignmentId: id });
  }

  async update(id: number, data: Partial<FeedBatchAssignment>) {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (updated) {
      await publishEvent(
        FEED_BATCH_ASSIGNMENTS_TOPIC,
        FeedBatchAssignmentsEvents.Updated,
        updated
      );
    }
    return updated;
  }

  async delete(id: number) {
    const toDelete = await this.findById(id);
    const result = await this.repo.delete(id);
    if (toDelete) {
      await publishEvent(
        FEED_BATCH_ASSIGNMENTS_TOPIC,
        FeedBatchAssignmentsEvents.Unassigned,
        toDelete
      );
    }
    return result;
  }
}

