#!/usr/bin/env node
// Lightweight JWT (HS256) generator without external deps
// Usage:
//   node scripts/generate-jwt.js --tenant tenant-001 --scope alerts:read,alerts:write --exp 1d
// Env:
//   JWT_SECRET (default: monitoring-service-secret)

const crypto = require('crypto');

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tenant' || a === '-t') args.tenantId = argv[++i];
    else if (a === '--sub') args.sub = argv[++i];
    else if (a === '--scope') args.scope = argv[++i];
    else if (a === '--exp') args.exp = argv[++i];
  }
  return args;
}

function parseExp(expStr, now) {
  // Supports seconds number or shorthand like 1h, 1d
  if (!expStr) return now + 24 * 3600; // default 1d
  const m = /^([0-9]+)([smhd])?$/.exec(expStr);
  if (!m) return now + 24 * 3600;
  const n = parseInt(m[1], 10);
  const unit = m[2] || 's';
  const mult = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return now + n * mult;
}

(function main() {
  const args = parseArgs(process.argv);
  const secret = process.env.JWT_SECRET || 'monitoring-service-secret';
  const now = Math.floor(Date.now() / 1000);
  const exp = parseExp(args.exp, now);
  const scope = (args.scope || 'alerts:read').split(',').map(s => s.trim()).filter(Boolean);

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: args.sub || 'tester',
    tenantId: args.tenantId || 'tenant-001',
    scope,
    iat: now,
    exp,
  };

  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const token = `${data}.${signature}`;
  console.log(token);
})();

