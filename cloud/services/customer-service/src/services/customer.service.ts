// src/services/customer.service.ts
import { ILike, IsNull } from 'typeorm';
import { AppDataSource } from '../utils/dataSource';
import { Customer } from '../models/customer.model';
import type { Pagination, Scoped } from './types';
import { publishCustomerEvent } from '../utils/kafka';

export class CustomerService {
  private repo = AppDataSource.getRepository(Customer);

  async list(opts: Scoped & Pagination) {
    const { tenant_id, page = 1, limit = 20, q, sort = 'created_at', order = 'DESC' } = opts;
    const where: any = { tenant_id, deleted_at: null };
    if (q) where.name = ILike(`%${q}%`);

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { [sort]: order as any },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async findOneScoped(tenant_id: string, customer_id: number) {
  return this.repo.findOne({
    where: { tenant_id, customer_id, deleted_at: IsNull() }
    });
  }

  async create(data: Partial<Customer> & { tenant_id: string }) {
    const saved = await this.repo.save(this.repo.create(data));
    await publishCustomerEvent('created', { customer_id: saved.customer_id, tenant_id: saved.tenant_id });
    return saved;
  }

  async updateScoped(tenant_id: string, customer_id: number, data: Partial<Customer>) {
    const item = await this.findOneScoped(tenant_id, customer_id);
    if (!item) return null;
    Object.assign(item, data);
    const saved = await this.repo.save(item);
    await publishCustomerEvent('updated', { customer_id, tenant_id });
    return saved;
  }

  /** soft delete */
  async softDeleteScoped(tenant_id: string, customer_id: number) {
    await this.repo.update({ tenant_id, customer_id }, { deleted_at: new Date(), status: 'deleted' as any });
    await publishCustomerEvent('deleted', { customer_id, tenant_id });
  }
}

