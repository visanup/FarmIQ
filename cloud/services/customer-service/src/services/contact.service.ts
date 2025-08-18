// src/services/contact.service.ts

import { AppDataSource } from '../utils/dataSource';
import { Contact } from '../models/contact.model';

export class ContactService {
  private repo = AppDataSource.getRepository(Contact);

  async listByCustomer(tenant_id: string, customer_id: number) {
    // ตรวจสอบ tenant ผ่าน join
    return this.repo.createQueryBuilder('ct')
      .innerJoin('customers.customers', 'c', 'c.customer_id = ct.customer_id AND c.deleted_at IS NULL')
      .where('ct.customer_id = :cid', { cid: customer_id })
      .andWhere('c.tenant_id = :tid', { tid: tenant_id })
      .orderBy('ct.created_at', 'DESC')
      .getMany();
  }

  async create(tenant_id: string, customer_id: number, data: Partial<Contact>) {
    // assert scope
    const exists = await this.repo.manager.query(
      'SELECT 1 FROM customers.customers WHERE customer_id=$1 AND tenant_id=$2 AND deleted_at IS NULL LIMIT 1',
      [customer_id, tenant_id],
    );
    if (!exists.length) throw new Error('Customer not found in tenant');

    const saved = await this.repo.save(this.repo.create({ ...data, customer_id }));
    return saved;
  }

  async delete(tenant_id: string, contact_id: number) {
    // safe delete with scope
    await this.repo.createQueryBuilder()
      .delete()
      .from(Contact)
      .where(`contact_id = :id AND customer_id IN (
        SELECT customer_id FROM customers.customers WHERE tenant_id = :tid AND deleted_at IS NULL
      )`, { id: contact_id, tid: tenant_id })
      .execute();
  }
}
