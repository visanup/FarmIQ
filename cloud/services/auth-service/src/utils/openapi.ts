// cloud\services\auth-service\src\utils\openapi.ts

import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { SignupBodySchema, LoginBodySchema, RefreshBodySchema } from '../schemas/auth.schemas';

export function buildOpenApiDoc(baseUrl: string) {
  const reg = new OpenAPIRegistry();

  // security scheme
  reg.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  // register Zod schemas -> components
  const SignupBody = reg.register('SignupBody', SignupBodySchema);
  const LoginBody = reg.register('LoginBody', LoginBodySchema);
  const RefreshBody = reg.register('RefreshBody', RefreshBodySchema);

  // paths
  reg.registerPath({
    method: 'post',
    path: '/api/auth/signup',
    summary: 'สมัครสมาชิกผู้ใช้ใหม่',
    tags: ['Auth'],
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: SignupBody } },
      },
    },
    responses: {
      201: { description: 'สมัครสำเร็จ' },
      400: { description: 'ข้อมูลไม่ครบหรือไม่ถูกต้อง' },
    },
  });

  reg.registerPath({
    method: 'post',
    path: '/api/auth/login',
    summary: 'เข้าสู่ระบบ',
    tags: ['Auth'],
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: LoginBody } },
      },
    },
    responses: {
      200: { description: 'สำเร็จ: ส่ง access/refresh token กลับ' },
      401: { description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
    },
  });

  reg.registerPath({
    method: 'post',
    path: '/api/auth/refresh',
    summary: 'แลก refresh token เป็น access token ใหม่ (rotate refresh ด้วย)',
    tags: ['Auth'],
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: RefreshBody } },
      },
    },
    responses: {
      200: { description: 'สำเร็จ: ส่ง access/refresh token ชุดใหม่' },
      401: { description: 'Refresh token ไม่ถูกต้องหรือหมดอายุ' },
    },
  });

  reg.registerPath({
    method: 'get',
    path: '/api/auth/me',
    summary: 'ดึงข้อมูลผู้ใช้งานปัจจุบัน',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'OK' },
      401: { description: 'Unauthorized' },
      404: { description: 'User not found' },
    },
  });

  const generator = new OpenApiGeneratorV3(reg.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication & Authorization endpoints',
    },
    servers: [{ url: baseUrl, description: 'Local dev server' }],
    security: [{ bearerAuth: [] }],
  });
}
