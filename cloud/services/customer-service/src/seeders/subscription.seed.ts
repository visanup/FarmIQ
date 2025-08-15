// services/customer-service/src/seeders/subscription.seed.ts

import { AppDataSource } from '../utils/dataSource';
import { Subscription } from '../models/subscription.model';
import { Customer } from '../models/customer.model';

async function seedSubscriptions() {
  // 1. เริ่มต้น DataSource
  await AppDataSource.initialize();
  const subRepo = AppDataSource.getRepository(Subscription);
  const custRepo = AppDataSource.getRepository(Customer);

  // 2. ดึงลูกค้าทั้งหมด
  const customers = await custRepo.find();

  // 3. เตรียมค่าต่างๆ สำหรับ mock
  const planTypes = ['basic', 'standard', 'premium'];
  const statuses = ['active', 'inactive', 'cancelled'];

  // 4. สร้าง array ของ subscription data
  const subsData = customers.map((cust, idx) => {
    // วนเลือก plan type กับ status ตาม index แค่เพื่อกระจายค่า
    const plan = planTypes[idx % planTypes.length];
    const status = statuses[idx % statuses.length];

    // สร้าง start_date ย้อนไป idx เดือน
    const start = new Date();
    start.setMonth(start.getMonth() - (idx % 12));
    const start_date = start.toISOString().slice(0, 10);

    // ถ้า status ไม่ใช่ active ให้กำหนด end_date ให้เป็น 3 เดือนหลัง start
    let end_date: string | undefined;
    if (status !== 'active') {
      const end = new Date(start);
      end.setMonth(end.getMonth() + 3);
      end_date = end.toISOString().slice(0, 10);
    }

    return {
      customer_id: cust.customer_id,
      plan_type: plan,
      start_date,
      end_date,
      status,
    };
  });

  // 5. บันทึกข้อมูลหากยังไม่มี
  for (const data of subsData) {
    const exists = await subRepo.findOneBy({ customer_id: data.customer_id });
    if (!exists) {
      const sub = subRepo.create(data);
      await subRepo.save(sub);
    }
  }

  console.log('✅ Seeded subscriptions for all customers');
  await AppDataSource.destroy();
}

seedSubscriptions().catch(err => {
  console.error('❌ Seed subscriptions failed:', err);
  process.exit(1);
});
