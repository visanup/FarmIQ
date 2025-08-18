// src/services/subscription.service.ts
import { AppDataSource } from '../utils/dataSource';
import { Subscription } from '../models/subscription.model';
import { PlanCatalog } from '../models/plan_catalog.model';

export class SubscriptionService {
  private repo = AppDataSource.getRepository(Subscription);
  private planRepo = AppDataSource.getRepository(PlanCatalog);

  async list(tenant_id: string) {
    // join ผ่าน customer_id -> customer.tenant_id
    return this.repo.createQueryBuilder('s')
      .innerJoin('customers.customers', 'c', 'c.customer_id = s.customer_id AND c.deleted_at IS NULL')
      .where('c.tenant_id = :tenant_id', { tenant_id })
      .orderBy('s.created_at', 'DESC')
      .getMany();
  }

  async findOneScoped(tenant_id: string, subscription_id: number) {
    return this.repo.createQueryBuilder('s')
      .innerJoin('customers.customers', 'c', 'c.customer_id = s.customer_id')
      .where('s.subscription_id = :subscription_id', { subscription_id })
      .andWhere('c.tenant_id = :tenant_id', { tenant_id })
      .getOne();
  }

  async createScoped(tenant_id: string, data: Partial<Subscription>) {
    // ตรวจว่า plan มีอยู่และ active
    const plan = await this.planRepo.findOne({ where: { plan_code: data.plan_code! , is_active: true } });
    if (!plan) throw new Error('Invalid or inactive plan_code');

    // ป้องกันซ้อน active หลายตัว (แล้วแต่กติกา)
    const hasActive = await this.repo.createQueryBuilder('s')
      .innerJoin('customers.customers', 'c', 'c.customer_id = s.customer_id')
      .where('c.tenant_id = :tenant_id', { tenant_id })
      .andWhere('s.customer_id = :cid', { cid: data.customer_id })
      .andWhere('s.status = :status', { status: 'active' })
      .getExists();

    if (hasActive && (data.status ?? 'active') === 'active') {
      throw new Error('Customer already has an active subscription');
    }

    const saved = await this.repo.save(this.repo.create(data));
    return saved;
  }

  async updateScoped(tenant_id: string, subscription_id: number, patch: Partial<Subscription>) {
    const s = await this.findOneScoped(tenant_id, subscription_id);
    if (!s) return null;
    Object.assign(s, patch);
    return this.repo.save(s);
  }

  async changePlan(tenant_id: string, subscription_id: number, plan_code: string) {
    const s = await this.findOneScoped(tenant_id, subscription_id);
    if (!s) return null;
    const plan = await this.planRepo.findOne({ where: { plan_code, is_active: true } });
    if (!plan) throw new Error('Invalid or inactive plan_code');
    s.plan_code = plan_code;
    return this.repo.save(s);
  }

  async cancel(tenant_id: string, subscription_id: number) {
    return this.updateScoped(tenant_id, subscription_id, { status: 'canceled' as any });
  }

  async pause(tenant_id: string, subscription_id: number) {
    return this.updateScoped(tenant_id, subscription_id, { status: 'paused' as any });
  }

  async resume(tenant_id: string, subscription_id: number) {
    return this.updateScoped(tenant_id, subscription_id, { status: 'active' as any });
  }

  async getActiveForCustomer(customer_id: number) {
    return this.repo.findOne({ where: { customer_id, status: 'active' as any } });
  }
}
