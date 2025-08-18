// src/services/customer_user.service.ts

import { AppDataSource } from '../utils/dataSource';
import { CustomerUser } from '../models/customer_user.model';

export class CustomerUserService {
  private repo = AppDataSource.getRepository(CustomerUser);

  async listMembers(tenant_id: string, customer_id: number) {
    return this.repo
      .createQueryBuilder('m')
      .innerJoin(
        'customers.customers',
        'c',
        'c.customer_id = m.customer_id AND c.deleted_at IS NULL',
      )
      .where('m.customer_id = :cid', { cid: customer_id })
      .andWhere('c.tenant_id = :tid', { tid: tenant_id })
      .getMany();
  }

  async addMember(
    tenant_id: string,
    customer_id: number,
    user_id: string,
    role: CustomerUser['role'] = 'member',
  ) {
    // verify scope
    const ok = await this.repo.manager.query(
      'SELECT 1 FROM customers.customers WHERE customer_id=$1 AND tenant_id=$2 AND deleted_at IS NULL LIMIT 1',
      [customer_id, tenant_id],
    );
    if (!ok.length) throw new Error('Customer not found in tenant');
    return this.repo.save(this.repo.create({ customer_id, user_id, role }));
  }

  async removeMember(tenant_id: string, customer_user_id: number) {
    await this.repo
      .createQueryBuilder()
      .delete()
      .from(CustomerUser)
      .where(
        `customer_user_id = :id AND customer_id IN (
          SELECT customer_id FROM customers.customers WHERE tenant_id = :tid AND deleted_at IS NULL
        )`,
        { id: customer_user_id, tid: tenant_id },
      )
      .execute();
  }
}