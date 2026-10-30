import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestIdMiddleware } from './src/server/middleware/auth.js';
import { adminRouter } from './src/server/routes/admin.routes.js';
import { authRouter } from './src/server/routes/auth.routes.js';
import { bookingsRouter } from './src/server/routes/bookings.routes.js';
import { paymentsRouter } from './src/server/routes/payments.routes.js';
import { stationsRouter } from './src/server/routes/stations.routes.js';
import { trainsRouter } from './src/server/routes/trains.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestIdMiddleware as any);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'RailConnect API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      providerMode: process.env.RAILWAY_PROVIDER_MODE || 'demo',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/users', authRouter);
  app.use('/api/stations', stationsRouter);
  app.use('/api/trains', trainsRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);

  // Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    // Avoid logging passwords, tokens, or sensitive information
    console.error(`[API ERROR ${status}] ${req.method} ${req.url} - ${message}`);

    res.status(status).json({
      error: err.code || 'INTERNAL_SERVER_ERROR',
      message: isProd && status === 500 ? 'An unexpected error occurred. Please try again.' : message,
      requestId: (req as any).requestId,
    });
  });

  // Frontend handling
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚆 RailConnect Server running on port ${PORT}`);
    console.log(`🔌 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚉 Railway Provider: ${process.env.RAILWAY_PROVIDER_MODE || 'demo'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start RailConnect server:', err);
  process.exit(1);
});
