// src/services/me.service.ts

import { AppDataSource } from '../utils/dataSource';
import { Customer } from '../models/customer.model';

export class MeService {
  async myCustomers(user_id: string, tenant_id: string) {
    return AppDataSource.getRepository(Customer).createQueryBuilder('c')
      .innerJoin('customers.customer_users', 'm', 'm.customer_id = c.customer_id')
      .where('m.user_id = :uid', { uid: user_id })
      .andWhere('c.tenant_id = :tid', { tid: tenant_id })
      .andWhere('c.deleted_at IS NULL')
      .getMany();
  }
}
