// ==========================
// src/utils/dataSource.ts
// ==========================
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Alert } from '../models/alert.model';


// Resolve envs with safe defaults (prefer service name on Docker network)
const HOST = (process.env.DB_HOST || 'farmiq-postgres').trim();
const PORT = parseInt(process.env.DB_PORT || '5432', 10);
const NAME = (process.env.DB_NAME || 'farmiq_cloud').trim();
const USER = (process.env.DB_USER || 'postgres').trim();
const PASS = (process.env.DB_PASSWORD || 'postgres').trim();
const SCHEMA = (process.env.DB_SCHEMA || 'public').trim();
const ENV = (process.env.ENV || 'dev').trim();


// NOTE: TypeORM (postgres) options:
// - Do NOT use `connectTimeoutMS` (that is for Mongo). For pg, pass timeouts via `extra`.
// - `poolSize` is not a pg option here; use `extra.max` instead.


export const AppDataSource = new DataSource({
type: 'postgres',
host: HOST,
port: PORT,
username: USER,
password: PASS,
database: NAME,
schema: SCHEMA,
entities: [Alert],
synchronize: false,
logging: ENV === 'dev',
// Valid pg options go under `extra`
extra: {
application_name: process.env.PG_APP_NAME || 'analytics-alerts',
max: Number(process.env.PG_POOL_MAX || 20), // pool size
idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 10_000),
statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS || 0), // 0 = disabled
query_timeout: Number(process.env.PG_QUERY_TIMEOUT_MS || 0),
keepAlive: true,
},
});