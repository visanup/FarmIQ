import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string;
    email: string;
    role: string;
    scopes?: string[];
  };
}

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    const payload = await authService.verifyToken(token);
    
    // Attach user info to request
    (request as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'USER',
      scopes: (payload as any).scopes || [],
    };
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function requireRole(
  roles: string[]
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as AuthenticatedRequest).user;
    
    if (!user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  };
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const roleChecker = await requireRole(['ADMIN']);
  return await roleChecker(request, reply);
}

export function requireScopes(required: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as AuthenticatedRequest).user;
    if (!user) return reply.status(401).send({ error: 'Authentication required' });
    const scopes = user.scopes || [];
    const ok = required.every((s) => scopes.includes(s));
    if (!ok) return reply.status(403).send({ error: 'Insufficient scopes' });
  };
}
