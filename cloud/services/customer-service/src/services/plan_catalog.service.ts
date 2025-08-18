// src/services/plan_catalog.service.ts

import { AppDataSource } from '../utils/dataSource';
import { PlanCatalog } from '../models/plan_catalog.model';

export class PlanCatalogService {
  private repo = AppDataSource.getRepository(PlanCatalog);

  async list(activeOnly = true) {
    return this.repo.find({ where: activeOnly ? { is_active: true } : {} });
  }

  async upsert(plan: PlanCatalog) {
    return this.repo.save(plan);
  }

  async seedDefaults() {
    const defaults: PlanCatalog[] = [
      Object.assign(new PlanCatalog(), {
        plan_code: 'PRO', name: 'Pro', description: 'For small teams',
        entitlements: { max_devices: 50, alerting: true }, is_active: true,
      }),
      Object.assign(new PlanCatalog(), {
        plan_code: 'ENTERPRISE', name: 'Enterprise', description: 'For org scale',
        entitlements: { max_devices: 1000, alerting: true, sso: true }, is_active: true,
      }),
    ];
    for (const p of defaults) await this.repo.save(p);
  }
}
