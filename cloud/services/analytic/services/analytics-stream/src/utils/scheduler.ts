// src/utils/scheduler.ts

export function every(ms: number, fn: () => Promise<void>) {
  const tick = async () => {
    try { await fn(); } catch {}
    setTimeout(tick, ms);
  };
  setTimeout(tick, ms);
}