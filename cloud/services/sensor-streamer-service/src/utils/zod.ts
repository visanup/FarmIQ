// src/utils/zod.ts
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// เพิ่มเมธอด .openapi() ให้ schema ของ zod
extendZodWithOpenApi(z);

export { z };


