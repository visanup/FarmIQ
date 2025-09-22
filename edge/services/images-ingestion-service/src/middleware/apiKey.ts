//edge\services\images-ingestion-service\src\middleware\apiKey.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { API_KEY } from '../configs/config';
function mask(value: string, visible = 3) {
  if (!value) return '';
  return value.slice(0, visible) + '*'.repeat(Math.max(0, value.length - visible));
}
export async function apiKey(req: FastifyRequest, reply: FastifyReply) {
  // Accept several common header/query variants
  const xHeader = req.headers['x-api-key'];
  const apiHeader = req.headers['apikey'];
  const authHeader = req.headers['authorization'];
  const queryKey = (req.query as any)?.api_key || (req.query as any)?.apikey;
  let authToken: string | undefined;
  if (typeof authHeader === 'string') {
    const m = authHeader.match(/^(ApiKey|Bearer)\s+(.+)$/i);
    if (m) authToken = m[2];
  }
  const headerKey = Array.isArray(xHeader) ? xHeader[0] : (xHeader as string | undefined);
  const altHeader = Array.isArray(apiHeader) ? apiHeader[0] : (apiHeader as string | undefined);
  const key = headerKey || altHeader || authToken || (Array.isArray(queryKey) ? queryKey[0] : queryKey);
  if (!API_KEY) {
    reply.code(500).send({ error: 'Service misconfigured: API_KEY missing' });
    return;
  }
  if (!key) {
    // Log for troubleshooting but do not reveal expected key
    console.warn('[auth] missing API key', {
      path: req.url,
      hasXApiKey: Boolean(xHeader),
      hasApikey: Boolean(apiHeader),
      hasAuthorization: Boolean(authHeader),
      queryHasKey: Boolean(queryKey),
    });
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  if (key !== API_KEY) {
    console.warn('[auth] invalid API key', { path: req.url, provided: mask(String(key)) });
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
}