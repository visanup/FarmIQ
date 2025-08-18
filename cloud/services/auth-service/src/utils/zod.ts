// src/utils/zod.ts (เวอร์ชัน fallback ได้)
import { z } from 'zod';
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');
  extendZodWithOpenApi(z);
} catch (e) {
  // ไม่มี lib ก็ข้าม — validation ยังใช้ได้ตามปกติ
}
export { z };



