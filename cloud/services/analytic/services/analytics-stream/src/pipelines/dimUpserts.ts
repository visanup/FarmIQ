import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { db } from '../configs/config';


const FQN = (name: string) => `${db.schema}.${name}`;


const Time = z.preprocess((input) => {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input > 1e12 ? input : input * 1000);
  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{13}$/.test(s)) return new Date(Number(s));
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) return new Date(s.replace(' ', 'T') + 'Z');
    const d = new Date(s); if (!Number.isNaN(d.getTime())) return d;
  }
  return input;
}, z.date());


const unwrap = (o: any) => (o && typeof o === 'object' && 'data' in o && o.data && typeof o.data === 'object') ? o.data : o;


const KEY_MAP: Record<string, string> = {
  tenantId: 'tenant_id',
  deviceId: 'device_id',
  farmId: 'farm_id',
  houseId: 'house_id',
  customerId: 'customer_id',
  flockId: 'flock_id',
  animalTypeId: 'animal_type_id',
  animalType: 'animal_type_id', // accept "animalType" during test
  breedId: 'breed_id',
  startDate: 'start_date',
  endDate: 'end_date',
  updatedAt: 'updated_at',
  serialNo: 'serial_no',
};


function normalizeKeys<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj as T;
  const out: any = { ...obj };
  for (const [from, to] of Object.entries(KEY_MAP)) {
    if (out[from] !== undefined && out[to] === undefined) out[to] = out[from];
  }
  return out as T;
}


async function upsertRow(
  table: string,
  cols: Record<string, any>,
  conflictKeys: string[],
  jsonCols: string[] = []
) {
  const keys = Object.keys(cols);
  const values = keys.map((k) => jsonCols.includes(k) ? JSON.stringify(cols[k] ?? null) : (cols[k] ?? null));
  const placeholders = keys.map((k, i) => jsonCols.includes(k) ? `$${i + 1}::jsonb` : `$${i + 1}`);
  const updateList = keys.filter((k) => !conflictKeys.includes(k)).map((k) => `${k} = EXCLUDED.${k}`).join(', ');


  const sql = `
INSERT INTO ${FQN(table)} (${keys.join(', ')})
VALUES (${placeholders.join(', ')})
ON CONFLICT (${conflictKeys.join(', ')})
DO UPDATE SET ${updateList};
`;


  // DIAGNOSTIC (temporary): show where and what we upsert
  try {
    console.log('[SQL] target =', `${db.schema}.${table}`);
    console.log('[SQL] columns =', keys);
    console.log('[SQL] conflict =', conflictKeys);
  } catch { }


  await prisma.$executeRawUnsafe(sql, ...values);
}

/** ---------- table names ---------- */
const TABLES = {
  device: 'dim_device',
  farm: 'dim_farm',
  house: 'dim_house',
  flock: 'dim_flock',
  customer: 'dim_customer',
  animalType: 'dim_animal_type',
  breed: 'dim_breed',
};

/** ---------- Schemas ---------- */

// tenant_id optional + default at upsert during test/dev
const BaseSnap = z.object({
  tenant_id: z.string().min(1).optional(),
  updated_at: Time.optional(),
  meta: z.record(z.unknown()).optional(),
});

const DeviceSnap = BaseSnap.extend({
  device_id: z.string().min(1),
  farm_id: z.string().optional(),
  house_id: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  name: z.string().optional(),
  model: z.string().optional(),
  vendor: z.string().optional(),
  serial_no: z.string().optional(),
});

const FarmSnap = BaseSnap.extend({
  farm_id: z.string().min(1),
  name: z.string().optional(),
  lat: z.number().finite().optional(),
  lon: z.number().finite().optional(),
  region: z.string().optional(),
});

const HouseSnap = BaseSnap.extend({
  house_id: z.string().min(1),
  farm_id: z.string().min(1),
  name: z.string().optional(),
  capacity: z.number().finite().optional(),
  type: z.string().optional(),
});

const FlockSnap = BaseSnap.extend({
  flock_id: z.string().min(1),
  house_id: z.string().min(1).optional(),
  farm_id: z.string().optional(),
  breed: z.string().optional(),
  sex: z.enum(['male', 'female', 'mixed']).optional(),
  population: z.number().int().nonnegative().optional(),
  start_date: Time.optional(),
  end_date: Time.optional(),
});

const CustomerSnap = BaseSnap.extend({
  customer_id: z.string().min(1),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const AnimalTypeSnap = BaseSnap.extend({
  animal_type_id: z.string().min(1),
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

// ⬇️ ทำให้ optional เพื่อกันล้มเมื่อ producer ยังไม่ส่ง animal_type_id จริง ๆ
const BreedSnap = BaseSnap.extend({
  breed_id: z.string().min(1),
  animal_type_id: z.string().min(1), // REQUIRED to match your Prisma model
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  characteristics: z.record(z.unknown()).optional(),
});

/** ---------- Upsert functions ---------- */
const TENANT_FALLBACK = 'default-tenant';

export async function handleDeviceSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.device_id && src.id) src.device_id = String(src.id);
  const d = DeviceSnap.parse(src);
  await upsertRow(
    TABLES.device,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      device_id: d.device_id,
      farm_id: d.farm_id ?? null,
      house_id: d.house_id ?? null,
      type: d.type ?? null,
      status: d.status ?? null,
      name: d.name ?? null,
      model: d.model ?? null,
      vendor: d.vendor ?? null,
      serial_no: d.serial_no ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'device_id'],
    ['meta']
  );
}

export async function handleFarmSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.farm_id && src.id) src.farm_id = String(src.id);
  const d = FarmSnap.parse(src);
  await upsertRow(
    TABLES.farm,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      farm_id: d.farm_id,
      name: d.name ?? null,
      lat: d.lat ?? null,
      lon: d.lon ?? null,
      region: d.region ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'farm_id'],
    ['meta']
  );
}

export async function handleHouseSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.house_id && src.id) src.house_id = String(src.id);
  const d = HouseSnap.parse(src);
  await upsertRow(
    TABLES.house,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      house_id: d.house_id,
      farm_id: d.farm_id,
      name: d.name ?? null,
      capacity: d.capacity ?? null,
      type: d.type ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'house_id'],
    ['meta']
  );
}

export async function handleFlockSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.flock_id && src.id) src.flock_id = String(src.id);
  if (!src.breed && src.breed_id) src.breed = src.breed_id;
  const d = FlockSnap.parse(src);
  await upsertRow(
    TABLES.flock,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      flock_id: d.flock_id,
      house_id: d.house_id ?? null,
      farm_id: d.farm_id ?? null,
      breed: d.breed ?? null,
      sex: d.sex ?? null,
      population: d.population ?? null,
      start_date: d.start_date ?? null,
      end_date: d.end_date ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'flock_id'],
    ['meta']
  );
}

export async function handleCustomerSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.customer_id && src.id) src.customer_id = String(src.id);
  const d = CustomerSnap.parse(src);
  await upsertRow(
    TABLES.customer,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      customer_id: d.customer_id,
      name: d.name ?? null,
      email: d.email ?? null,
      phone: d.phone ?? null,
      address: d.address ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'customer_id'],
    ['meta']
  );
}

export async function handleAnimalTypeSnapshot(o: any) {
  const src0 = normalizeKeys(unwrap(o));
  const src = { ...src0 } as any;
  if (!src.animal_type_id && src.id) src.animal_type_id = String(src.id);
  const d = AnimalTypeSnap.parse(src);
  await upsertRow(
    TABLES.animalType,
    {
      tenant_id: d.tenant_id ?? TENANT_FALLBACK,
      animal_type_id: d.animal_type_id,
      name: d.name ?? null,
      category: d.category ?? null,
      description: d.description ?? null,
      meta: d.meta ?? {},
      updated_at: d.updated_at ?? new Date(),
    },
    ['tenant_id', 'animal_type_id'],
    ['meta']
  );
}

export async function handleBreedSnapshot(o: any) {
  const inner = unwrap(o);
  console.log('[BREED] inner keys:', inner && typeof inner === 'object' ? Object.keys(inner) : 'not-an-object');


  const src0 = normalizeKeys(inner);
  const src: any = { ...src0 };


  // id -> breed_id (if not provided as breed_id / breedId)
  if (!src.breed_id && src.id) src.breed_id = String(src.id);


  // Accept several shapes for animal type reference
  if (!src.animal_type_id) {
    // string forms
    if (typeof src.animalTypeId === 'string') src.animal_type_id = src.animalTypeId;
    else if (typeof src.animalType === 'string') src.animal_type_id = src.animalType;


    // object forms: { id: 'broiler' } or { code: 'broiler' } or { name: 'Broiler' }
    else if (src.animalType && typeof src.animalType === 'object') {
      const at = src.animalType;
      src.animal_type_id = String(at.id ?? at.code ?? at.name ?? '').trim() || undefined;
    }
    else if (src.animal_type && typeof src.animal_type === 'object') {
      const at = src.animal_type;
      src.animal_type_id = String(at.id ?? at.code ?? at.name ?? '').trim() || undefined;
    }
  }


  // Final visibility before validation
  console.log('[BREED] normalized keys:', Object.keys(src));
  console.log('[BREED] preview:', { breed_id: src.breed_id, animal_type_id: src.animal_type_id, name: src.name });


  // Hard-require per DB schema: if missing, throw an explicit, visible error
  if (!src.breed_id) throw new Error('breed_id is required (after normalization)');
  if (!src.animal_type_id) throw new Error('animal_type_id is required (after normalization)');


  const d = BreedSnap.parse(src);


  const cols = {
    tenant_id: d.tenant_id ?? TENANT_FALLBACK,
    breed_id: d.breed_id,
    animal_type_id: d.animal_type_id,
    name: d.name ?? null,
    code: d.code ?? null,
    description: d.description ?? null,
    characteristics: d.characteristics ?? {},
    meta: d.meta ?? {},
    updated_at: d.updated_at ?? new Date(),
  };


  console.log('[BREED] upsert columns:', cols);
  await upsertRow(
    TABLES.breed,
    cols,
    ['tenant_id', 'breed_id'],
    ['meta', 'characteristics']
  );
  console.log('✅ [BREED] upsert done');
}
