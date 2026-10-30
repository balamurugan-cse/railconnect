import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import {
  AuthenticatedRequest,
  generateAccessToken,
  generateRefreshToken,
  JWT_REFRESH_SECRET,
  requireAuth,
} from '../middleware/auth.js';
import { User } from '../types.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, phone, password, termsAccepted } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Full name is required (min 2 characters).' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters long.' });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'You must accept the RailConnect Terms of Service.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'USER_EXISTS',
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.set(newUser.id, newUser);

    db.logAudit({
      actorUserId: newUser.id,
      actorEmail: newUser.email,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: newUser.id,
      requestId: req.requestId,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Set secure cookie
    res.cookie('rc_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to complete registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    db.logAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      requestId: req.requestId,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('rc_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to process login.' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', (req: AuthenticatedRequest, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; email: string };
    const user = db.users.get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'User not found.' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('rc_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired refresh token.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: AuthenticatedRequest, res) => {
  res.clearCookie('rc_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Email is required.' });
  }

  // Demo password reset response without exposing user existence
  return res.json({
    success: true,
    message: 'If an account with that email exists, password reset instructions have been dispatched.',
  });
});

// GET /api/users/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// PATCH /api/users/me
authRouter.patch('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, phone, currentPassword, newPassword } = req.body;

  if (name && typeof name === 'string' && name.trim().length >= 2) {
    user.name = name.trim();
  }

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Current password is required to change password.' });
    }
    const isCurrentValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'New password must be at least 8 characters long.' });
    }
    user.passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
  }

  user.updatedAt = new Date().toISOString();
  db.users.set(user.id, user);

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});
