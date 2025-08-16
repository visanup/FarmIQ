// src/utils/zod.ts

import { z as baseZ } from 'zod';
export const z = baseZ;

try {
  // ใช้ require แบบ dynamic จะไม่ error ตอนคอมไพล์ถ้า module ไม่มี
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');
  extendZodWithOpenApi(baseZ);
} catch {
  // ไม่ทำอะไร — ถ้าไม่มี lib นี้ ก็ข้ามการ extend ไป
}


