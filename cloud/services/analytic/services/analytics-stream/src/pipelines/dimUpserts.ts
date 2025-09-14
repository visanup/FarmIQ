// src/pipelines/dimUpserts.ts
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { db } from '../configs/config';

/** ---------- helpers ---------- */
const FQN = (name: string) => `${db.schema}.${name}`;

/** robust time parser (ISO / epoch sec|ms / 'YYYY-MM-DD HH:mm:ss[.SSS]') */
const Time = z.preprocess((input) => {
  if (input instanceof Date) return input;

  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000;
    return new Date(ms);
  }

  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));        // epoch ms
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000); // epoch sec
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      return new Date(s.replace(' ', 'T') + 'Z');              // 'YYYY-MM-DD HH:mm:ss(.SSS)'
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());

/** SQL upsert generic — แปลง object → INSERT ... ON CONFLICT ... DO UPDATE */
async function upsertRow(
  table: string,
  cols: Record<string, any>,
  conflictKeys: string[],
  jsonCols: string[] = []  // ชื่อคอลัมน์ที่ต้อง cast เป็น JSONB
) {
  const keys = Object.keys(cols);
  const values = keys.map((k) => {
    const v = cols[k];
    if (v === undefined) return null;
    if (jsonCols.includes(k)) return JSON.stringify(v);
    return v;
  });

  const placeholders = keys.map((_, i) => `$${i + 1}`);

  // กำหนด cast ::jsonb ให้กับคอลัมน์ JSON เพื่อความชัดเจน
  const columnList = keys
    .map((k, i) => (jsonCols.includes(k) ? `${k}::jsonb` : k))
    .join(', ');

  const updateList = keys
    .filter((k) => !conflictKeys.includes(k))
    .map((k) => `${k} = ${jsonCols.includes(k) ? 'EXCLUDED.' + k + '::jsonb' : 'EXCLUDED.' + k}`)
    .join(', ');

  const sql = `
    INSERT INTO ${FQN(table)} (${columnList})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT (${conflictKeys.join(', ')})
    DO UPDATE SET ${updateList};
  `;

  await prisma.$executeRaw`${sql}`;
}

/** ---------- table names (แก้ได้ตามจริงของคุณ) ---------- */
const TABLES = {
  device: 'dim_device',
  farm:   'dim_farm',
  house:  'dim_house',
  flock:  'dim_flock',
  customer: 'dim_customer',
  animalType: 'dim_animal_type',
  breed: 'dim_breed',
};

/** ---------- Schemas ---------- */

const BaseSnap = z.object({
  tenant_id: z.string().min(1),
  updated_at: Time.optional(),  // ถ้าไม่ส่ง จะใช้ now()
  meta: z.record(z.unknown()).optional(),
});

const DeviceSnap = BaseSnap.extend({
  device_id: z.string().min(1),
  farm_id:   z.string().optional(),
  house_id:  z.string().optional(),
  type:      z.string().optional(),      // controller/sensor/actuator/...
  status:    z.string().optional(),      // active/inactive/...
  name:      z.string().optional(),
  model:     z.string().optional(),
  vendor:    z.string().optional(),
  serial_no: z.string().optional(),
});

const FarmSnap = BaseSnap.extend({
  farm_id: z.string().min(1),
  name:    z.string().optional(),
  lat:     z.number().finite().optional(),
  lon:     z.number().finite().optional(),
  region:  z.string().optional(),
});

const HouseSnap = BaseSnap.extend({
  house_id: z.string().min(1),
  farm_id:  z.string().min(1),
  name:     z.string().optional(),
  capacity: z.number().finite().optional(),
  type:     z.string().optional(),       // broiler/layer/...
});

const FlockSnap = BaseSnap.extend({
  flock_id:  z.string().min(1),
  house_id:  z.string().min(1),
  farm_id:   z.string().optional(),
  breed:     z.string().optional(),
  sex:       z.enum(['male','female','mixed']).optional(),
  population:z.number().int().nonnegative().optional(),
  start_date: Time.optional(),
  end_date:   Time.optional(),
});

const CustomerSnap = BaseSnap.extend({
  customer_id: z.string().min(1),
  name:        z.string().optional(),
  email:       z.string().optional(),
  phone:       z.string().optional(),
  address:     z.string().optional(),
});

const AnimalTypeSnap = BaseSnap.extend({
  animal_type_id: z.string().min(1),
  name:           z.string().optional(),
  category:       z.string().optional(),
  description:    z.string().optional(),
});

const BreedSnap = BaseSnap.extend({
  breed_id:       z.string().min(1),
  animal_type_id: z.string().min(1),
  name:           z.string().optional(),
  code:           z.string().optional(),
  description:    z.string().optional(),
  characteristics: z.record(z.unknown()).optional(),
});

/** ---------- Upsert functions ---------- */

export async function handleDeviceSnapshot(o: any) {
  const d = DeviceSnap.parse(o);
  await upsertRow(
    TABLES.device,
    {
      tenant_id: d.tenant_id,
      device_id: d.device_id,
      farm_id:   d.farm_id ?? null,
      house_id:  d.house_id ?? null,
      type:      d.type ?? null,
      status:    d.status ?? null,
      name:      d.name ?? null,
      model:     d.model ?? null,
      vendor:    d.vendor ?? null,
      serial_no: d.serial_no ?? null,
      meta:      d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'device_id'],
    ['meta']
  );
}

export async function handleFarmSnapshot(o: any) {
  const d = FarmSnap.parse(o);
  await upsertRow(
    TABLES.farm,
    {
      tenant_id: d.tenant_id,
      farm_id:   d.farm_id,
      name:      d.name ?? null,
      lat:       d.lat ?? null,
      lon:       d.lon ?? null,
      region:    d.region ?? null,
      meta:      d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'farm_id'],
    ['meta']
  );
}

export async function handleHouseSnapshot(o: any) {
  const d = HouseSnap.parse(o);
  await upsertRow(
    TABLES.house,
    {
      tenant_id: d.tenant_id,
      house_id:  d.house_id,
      farm_id:   d.farm_id,
      name:      d.name ?? null,
      capacity:  d.capacity ?? null,
      type:      d.type ?? null,
      meta:      d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'house_id'],
    ['meta']
  );
}

export async function handleFlockSnapshot(o: any) {
  const d = FlockSnap.parse(o);
  await upsertRow(
    TABLES.flock,
    {
      tenant_id:  d.tenant_id,
      flock_id:   d.flock_id,
      house_id:   d.house_id,
      farm_id:    d.farm_id ?? null,
      breed:      d.breed ?? null,
      sex:        d.sex ?? null,
      population: d.population ?? null,
      start_date: d.start_date ?? null,
      end_date:   d.end_date ?? null,
      meta:       d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'flock_id'],
    ['meta']
  );
}

export async function handleCustomerSnapshot(o: any) {
  const d = CustomerSnap.parse(o);
  await upsertRow(
    TABLES.customer,
    {
      tenant_id:   d.tenant_id,
      customer_id: d.customer_id,
      name:        d.name ?? null,
      email:       d.email ?? null,
      phone:       d.phone ?? null,
      address:     d.address ?? null,
      meta:        d.meta ?? {},
      updated_at:  d.updated_at ?? new Date(),
    },
    ['tenant_id', 'customer_id'],
    ['meta']
  );
}

export async function handleAnimalTypeSnapshot(o: any) {
  const d = AnimalTypeSnap.parse(o);
  await upsertRow(
    TABLES.animalType,
    {
      tenant_id:      d.tenant_id,
      animal_type_id: d.animal_type_id,
      name:           d.name ?? null,
      category:       d.category ?? null,
      description:    d.description ?? null,
      meta:           d.meta ?? {},
      updated_at:     d.updated_at ?? new Date(),
    },
    ['tenant_id', 'animal_type_id'],
    ['meta']
  );
}

export async function handleBreedSnapshot(o: any) {
  const d = BreedSnap.parse(o);
  await upsertRow(
    TABLES.breed,
    {
      tenant_id:      d.tenant_id,
      breed_id:       d.breed_id,
      animal_type_id: d.animal_type_id,
      name:           d.name ?? null,
      code:           d.code ?? null,
      description:    d.description ?? null,
      characteristics: d.characteristics ?? {},
      meta:           d.meta ?? {},
      updated_at:     d.updated_at ?? new Date(),
    },
    ['tenant_id', 'breed_id'],
    ['meta', 'characteristics']
  );
}
