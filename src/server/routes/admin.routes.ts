import { Router } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { Station, Train } from '../types.js';

export const adminRouter = Router();

// Protect all admin routes with authentication and ADMIN role check
adminRouter.use(requireAuth, requireRole('ADMIN'));

// GET /api/admin/overview
adminRouter.get('/overview', (req: AuthenticatedRequest, res) => {
  const allBookings = Array.from(db.bookings.values());
  const confirmedBookings = allBookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.fareBreakdown.totalAmount, 0);

  const trainsCount = db.trains.size;
  const stationsCount = db.stations.size;
  const usersCount = db.users.size;

  return res.json({
    success: true,
    stats: {
      totalBookings: allBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: allBookings.filter((b) => b.status === 'CANCELLED').length,
      pendingBookings: allBookings.filter((b) => b.status === 'PENDING_PAYMENT').length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeTrains: trainsCount,
      activeStations: stationsCount,
      registeredUsers: usersCount,
      mode: process.env.RAILWAY_PROVIDER_MODE || 'demo',
    },
    recentBookings: allBookings.slice(0, 10),
    recentAuditLogs: db.auditLogs.slice(0, 15),
  });
});

// GET /api/admin/bookings
adminRouter.get('/bookings', (req: AuthenticatedRequest, res) => {
  const statusFilter = req.query.status as string;
  let bookings = Array.from(db.bookings.values());

  if (statusFilter && statusFilter !== 'ALL') {
    bookings = bookings.filter((b) => b.status === statusFilter);
  }

  bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// POST /api/admin/trains
adminRouter.post('/trains', (req: AuthenticatedRequest, res) => {
  const { trainNumber, name, trainType } = req.body;

  if (!trainNumber || !name || !trainType) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'trainNumber, name, and trainType are required.' });
  }

  const existing = Array.from(db.trains.values()).find((t) => t.trainNumber === trainNumber);
  if (existing) {
    return res.status(409).json({ error: 'DUPLICATE_TRAIN', message: `Train number ${trainNumber} already exists.` });
  }

  const newTrain: Train = {
    id: `trn_${trainNumber}`,
    trainNumber,
    name,
    trainType,
    active: true,
  };

  db.trains.set(newTrain.id, newTrain);

  db.logAudit({
    actorUserId: req.user?.id,
    actorEmail: req.user?.email,
    action: 'ADMIN_CREATE_TRAIN',
    resourceType: 'Train',
    resourceId: newTrain.id,
    requestId: req.requestId,
    details: { trainNumber, name },
  });

  return res.status(201).json({ success: true, train: newTrain });
});

// POST /api/admin/stations
adminRouter.post('/stations', (req: AuthenticatedRequest, res) => {
  const { code, name, city, state } = req.body;

  if (!code || !name || !city || !state) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'code, name, city, and state are required.' });
  }

  const upperCode = code.trim().toUpperCase();
  const existing = Array.from(db.stations.values()).find((s) => s.code === upperCode);

  if (existing) {
    return res.status(409).json({ error: 'DUPLICATE_STATION', message: `Station code ${upperCode} already exists.` });
  }

  const newStation: Station = {
    id: `stn_${upperCode.toLowerCase()}`,
    code: upperCode,
    name: name.trim(),
    city: city.trim(),
    state: state.trim(),
    active: true,
  };

  db.stations.set(newStation.id, newStation);

  db.logAudit({
    actorUserId: req.user?.id,
    actorEmail: req.user?.email,
    action: 'ADMIN_CREATE_STATION',
    resourceType: 'Station',
    resourceId: newStation.id,
    requestId: req.requestId,
    details: { code: upperCode, name },
  });

  return res.status(201).json({ success: true, station: newStation });
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', (_req, res) => {
  return res.json({
    success: true,
    count: db.auditLogs.length,
    logs: db.auditLogs,
  });
});

// GET /api/admin/system-health
adminRouter.get('/system-health', (_req, res) => {
  return res.json({
    status: 'HEALTHY',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    providers: {
      railway: {
        mode: process.env.RAILWAY_PROVIDER_MODE || 'demo',
        status: 'OPERATIONAL',
      },
      payment: {
        mode: process.env.PAYMENT_PROVIDER_MODE || 'sandbox',
        status: 'OPERATIONAL',
      },
    },
  });
});
