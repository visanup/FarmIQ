// src/utils/openapi.ts

import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  CustomerCreate, CustomerUpdate, PaginationQuery, IdParam,
  SubscriptionCreate, SubscriptionUpdate
} from '../schemas/customer.schemas';

const registry = new OpenAPIRegistry();

/** ✅ ลงทะเบียน securitySchemes ผ่าน component registry */
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

/** ตัวอย่าง paths (เติมของคุณเพิ่มได้ตาม routes ทั้งหมด) */
registry.registerPath({
  method: 'get',
  path: '/api/customers',
  tags: ['Customers'],
  request: { query: PaginationQuery },
  responses: { 200: { description: 'List customers' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/customers',
  tags: ['Customers'],
  request: { body: { content: { 'application/json': { schema: CustomerCreate } } } },
  responses: { 201: { description: 'Created' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/customers/{id}',
  tags: ['Customers'],
  request: { params: IdParam },
  responses: { 200: { description: 'Customer' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/customers/{id}',
  tags: ['Customers'],
  request: {
    params: IdParam,
    body: { content: { 'application/json': { schema: CustomerUpdate } } },
  },
  responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/subscriptions',
  tags: ['Subscriptions'],
  request: { body: { content: { 'application/json': { schema: SubscriptionCreate } } } },
  responses: { 201: { description: 'Created' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/subscriptions/{id}',
  tags: ['Subscriptions'],
  request: {
    params: IdParam,
    body: { content: { 'application/json': { schema: SubscriptionUpdate } } },
  },
  responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
});

/** 🔧 สร้างเอกสาร */
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Customer Service API',
    version: '1.0.0',
    description: 'Customer/Subscription APIs',
  },
  servers: [{ url: 'http://localhost:7301' }],
  /** OK ที่นี่: ตั้ง global security */
  security: [{ bearerAuth: [] }],
});


