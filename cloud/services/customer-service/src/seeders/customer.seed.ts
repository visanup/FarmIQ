// services/customer-service/src/seeders/customer.seed.ts

import { AppDataSource } from '../utils/dataSource';
import { Customer } from '../models/customer.model';

async function seedCustomers() {
  // 1. เริ่มต้น DataSource
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Customer);

  // 2. เตรียมข้อมูลลูกค้า 20 ราย
  const customers: Partial<Customer>[] = [
    { name: 'Acme Corp',      email: 'contact@acme.com',       phone: '081-000-0001', address: '123 Main St, Bangkok', billing_info: { plan: 'silver', creditLimit: 10000 } },
    { name: 'Foo Bar Co.',    email: 'hello@foobar.com',       phone: '081-000-0002', address: '45 Second Ave, Chiang Mai', billing_info: { plan: 'gold', creditLimit: 20000 } },
    { name: 'Delta Ltd.',     email: 'info@delta.com',         phone: '081-000-0003', address: '78 Third Rd, Phuket', billing_info: { plan: 'platinum', creditLimit: 50000 } },
    { name: 'Echo Inc.',      email: 'support@echo.com',       phone: '081-000-0004', address: '99 Fourth St, Khon Kaen', billing_info: { plan: 'silver' } },
    { name: 'Foxtrot LLC',    email: 'team@foxtrot.com',       phone: '081-000-0005', address: '12 Fifth Blvd, Hua Hin' },
    { name: 'Golf Industries',email: 'sales@golfind.com',       phone: '081-000-0006', address: '34 Sixth St, Pattaya' },
    { name: 'Hotel Group',    email: 'contact@hotelgroup.com', phone: '081-000-0007', address: '56 Seventh Rd, Udon Thani', billing_info: { plan: 'gold' } },
    { name: 'India Traders',  email: 'india@traders.com',      phone: '081-000-0008', address: '78 Eighth Ave, Nakhon Ratchasima' },
    { name: 'Juliet Services',email: 'juliet@services.com',    phone: '081-000-0009', address: '90 Ninth St, Surat Thani' },
    { name: 'Kilo Ventures',  email: 'info@kilov.com',         phone: '081-000-0010', address: '11 Tenth Blvd, Ubon Ratchathani', billing_info: { plan: 'silver', creditLimit: 15000 } },
    { name: 'Lima Systems',   email: 'team@limasys.com',       phone: '081-000-0011', address: '22 Eleventh Rd, Chanthaburi' },
    { name: 'Mike Corp',      email: 'mike@corp.com',          phone: '081-000-0012', address: '33 Twelfth Ave, Nakhon Si Thammarat' },
    { name: 'November Ltd.',  email: 'november@ltd.com',       phone: '081-000-0013', address: '44 Thirteenth St, Roi Et' },
    { name: 'Oscar LLC',      email: 'oscar@llc.com',          phone: '081-000-0014', address: '55 Fourteenth Blvd, Lampang' },
    { name: 'Papa Enterprises',email:'papa@enterprises.com',  phone: '081-000-0015', address: '66 Fifteenth Rd, Phitsanulok' },
    { name: 'Quebec Co.',     email: 'contact@quebec.com',     phone: '081-000-0016', address: '77 Sixteenth St, Sukhothai' },
    { name: 'Romeo Trading',  email: 'romeo@trading.com',      phone: '081-000-0017', address: '88 Seventeenth Ave, Trang' },
    { name: 'Sierra Solutions',email:'sierra@solutions.com',  phone: '081-000-0018', address: '99 Eighteenth Rd, Nakhon Pathom' },
    { name: 'Tango Works',    email: 'tango@works.com',        phone: '081-000-0019', address: '100 Nineteenth St, Prachuap Khiri Khan' },
    { name: 'Uniform Tech',   email: 'info@uniformtech.com',   phone: '081-000-0020', address: '200 Twentieth Blvd, Tak', billing_info: { plan: 'gold', creditLimit: 30000 } },
  ];

  // 3. บันทึกข้อมูลถ้ายังไม่มีในฐาน
  for (const data of customers) {
    const exists = await repo.findOneBy({ email: data.email });
    if (!exists) {
      const customer = repo.create(data);
      await repo.save(customer);
    }
  }

  console.log('✅ Seeded 20 customers');
  await AppDataSource.destroy();
}

seedCustomers().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
