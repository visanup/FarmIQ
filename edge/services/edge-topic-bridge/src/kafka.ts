// Kafka disabled in edge layer; keep stubs to avoid imports
export async function initKafka(): Promise<null> { return null; }
export async function produce(_topic: string, _key: string | null, _value: any) { /* no-op */ }

