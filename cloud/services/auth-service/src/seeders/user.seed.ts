// services/auth-service/src/seeders/user.seed.ts

import { AppDataSource } from '../utils/dataSource';
import { User } from '../models/user.model';
import fetch from 'node-fetch';
import { hashPassword } from '../utils/hash';
import { CUSTOMER_SERVICE_URL } from '../configs/config';

interface Customer {
  customer_id: number;
  name: string;
  email?: string;
  phone?: string;
  // ... อื่นๆ ถ้ามี
}

async function seedUsers() {
  // 1. เชื่อมต่อ DB ของ auth-service
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  // 2. ดึงรายชื่อลูกค้าทั้งหมดจาก customer-service
  const res = await fetch(`${CUSTOMER_SERVICE_URL}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch customers: ${res.status} ${res.statusText}`);
  }
  const customers: Customer[] = await res.json();

  // 3. สร้าง User สำหรับแต่ละ customer
  for (const cust of customers) {
    // ตั้ง username จากชื่อลูกค้า เช่น "Acme Corp" -> "acme_corp"
    const baseUsername = cust.name.trim().toLowerCase().replace(/\s+/g, '_');

    // กันชนถ้ามี username ซ้ำ (เช่น acme_corp, acme_corp2, acme_corp3…)
    let username = baseUsername;
    let suffix = 1;
    while (await userRepo.findOneBy({ username })) {
      suffix++;
      username = `${baseUsername}${suffix}`;
    }

    // สร้าง password แบบสุ่มหรือ default ก็ได้ (ที่นี่ใช้ 'Password123!')
    const rawPassword = 'password123!';
    const password_hash = await hashPassword(rawPassword);

    // ถ้ายังไม่มี user for this customer
    const exists = await userRepo.findOneBy({ customer_id: cust.customer_id });
    if (exists) continue;

    const user = userRepo.create({
      customer_id: cust.customer_id,
      username,
      password_hash,
      email: cust.email,
      role: 'user',
    });

    await userRepo.save(user);
    console.log(`  ✔ created user ${username} for customer ${cust.customer_id}`);
  }

  console.log('✅ Seeded all users');
  await AppDataSource.destroy();
}

seedUsers().catch(err => {
  console.error('❌ Seeding users failed:', err);
  process.exit(1);
});
