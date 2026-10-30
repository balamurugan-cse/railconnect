import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import { Role, User } from '../types.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'railconnect-super-secret-jwt-key-min-32-chars-long';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'railconnect-super-secret-refresh-key-min-32-chars';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  requestId?: string;
}

export function requestIdMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  req.requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.rc_token;

  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication credentials are required to access this resource.',
      requestId: req.requestId,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = db.users.get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'The account associated with this session no longer exists.',
        requestId: req.requestId,
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid session token.',
      requestId: req.requestId,
    });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.rc_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      const user = db.users.get(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token failure for optional auth
    }
  }
  next();
}

export function requireRole(role: Role) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
        requestId: req.requestId,
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Forbidden: This resource requires ${role} privileges.`,
        requestId: req.requestId,
      });
    }

    next();
  };
}

// In-memory token bucket rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(limit = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}_${req.baseUrl}`;

    const current = rateLimits.get(key);

    if (!current || now > current.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again shortly.',
        retryAfter: Math.ceil((current.resetAt - now) / 1000),
      });
    }

    current.count += 1;
    next();
  };
}
