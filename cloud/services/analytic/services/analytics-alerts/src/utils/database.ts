// ==========================
// src/utils/database.ts
// ==========================
import { AppDataSource } from './dataSource';


function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }


export function describeDbConfig() {
// We rely on process.env to reflect the actual runtime values
const host = (process.env.DB_HOST || 'farmiq-postgres').trim();
const port = (process.env.DB_PORT || '5432').trim();
const user = (process.env.DB_USER || 'postgres').trim();
const name = (process.env.DB_NAME || 'farmiq_cloud').trim();
const schema = (process.env.DB_SCHEMA || 'public').trim();
return { host, port, user, database: name, schema };
}


/**
* Initialize database connection with retry until ready.
* Avoids race conditions when Postgres is still starting up.
*/
export const initializeDatabase = async () => {
const totalTimeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 120_000);
const intervalMs = Number(process.env.DB_WAIT_INTERVAL_MS || 1_500);


const cfg = describeDbConfig();
console.log('DB cfg =>', cfg);


const start = Date.now();
let attempt = 0;
while (Date.now() - start < totalTimeoutMs) {
attempt += 1;
try {
if (!AppDataSource.isInitialized) {
await AppDataSource.initialize();
}
// Quick sanity check query
await AppDataSource.query('SELECT 1');
console.log(`✅ Database connected (attempt ${attempt})`);
return;
} catch (error: any) {
console.warn(`⏳ DB not ready (attempt ${attempt}): ${error?.message || error}`);
await sleep(intervalMs);
}
}
throw new Error(`Database not ready after ${totalTimeoutMs}ms`);
};


export const closeDatabase = async () => {
try {
if (AppDataSource.isInitialized) await AppDataSource.destroy();
console.log('🔌 Database disconnected');
} catch (error) {
console.error('❌ Database disconnect error:', error);
}
};