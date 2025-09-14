import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@farmiq.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin12345!';
  const name = process.env.ADMIN_NAME || 'System Administrator';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`[seed] Admin user already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hash, name, role: 'ADMIN' },
  });
  console.log(`[seed] Admin user created: ${user.email}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

