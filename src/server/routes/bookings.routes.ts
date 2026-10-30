import { Router } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { DemoRailwayProvider } from '../providers/railway/DemoRailwayProvider.js';
import { Booking, Passenger } from '../types.js';

export const bookingsRouter = Router();
const railwayProvider = new DemoRailwayProvider();

// POST /api/bookings/quote
bookingsRouter.post('/quote', async (req: AuthenticatedRequest, res) => {
  try {
    const { trainId, classCode, passengerCount = 1, fromCode, toCode } = req.body;

    if (!trainId || !classCode) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'trainId and classCode are required.' });
    }

    const count = Math.max(1, Math.min(6, Number(passengerCount) || 1));
    const fare = await railwayProvider.getFare(trainId, classCode, fromCode, toCode);

    const baseFareTotal = fare.baseAmount * count;
    const reservationTotal = fare.reservationFee * count;
    const superfastTotal = fare.superfastCharge * count;
    const subtotal = baseFareTotal + reservationTotal + superfastTotal;
    const taxes = fare.taxAmount * count;
    const discount = 0;
    const totalAmount = Math.round((subtotal + taxes - discount) * 100) / 100;

    return res.json({
      success: true,
      quote: {
        trainId,
        classCode,
        passengerCount: count,
        perPassenger: {
          baseFare: fare.baseAmount,
          reservationFee: fare.reservationFee,
          superfastCharge: fare.superfastCharge,
        },
        breakdown: {
          baseFare: baseFareTotal,
          reservationCharge: reservationTotal,
          superfastFee: superfastTotal,
          subtotal,
          taxes,
          discount,
          totalAmount,
        },
        currency: 'INR',
        sourceMode: fare.sourceMode,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// POST /api/bookings
bookingsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const {
      trainId,
      trainNumber,
      trainName,
      sourceStationCode,
      sourceStationName,
      destStationCode,
      destStationName,
      departureTime,
      arrivalTime,
      journeyDate,
      classCode,
      className,
      passengers,
      idempotencyKey,
    } = req.body;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = Array.from(db.bookings.values()).find(
        (b) => b.idempotencyKey === idempotencyKey && b.userId === user.id
      );
      if (existing) {
        return res.status(200).json({
          success: true,
          booking: existing,
          isDuplicate: true,
          message: 'Booking returned from existing idempotent request.',
        });
      }
    }

    // 2. Validation
    if (!trainId || !journeyDate || !classCode || !sourceStationCode || !destStationCode) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Missing required booking details (trainId, journeyDate, classCode, stations).',
      });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'At least one passenger is required to create a booking.',
      });
    }

    if (passengers.length > 6) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Maximum 6 passengers allowed per booking transaction.',
      });
    }

    for (const p of passengers) {
      if (!p.name || typeof p.name !== 'string' || p.name.trim().length < 2) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Each passenger must have a valid full name.',
        });
      }
      if (!p.age || isNaN(Number(p.age)) || Number(p.age) < 1 || Number(p.age) > 120) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Each passenger must have a valid age between 1 and 120.',
        });
      }
    }

    // 3. Re-verify availability
    const avail = await railwayProvider.getAvailability(trainId, journeyDate, classCode);
    if (avail.status === 'NOT_AVAILABLE') {
      return res.status(409).json({
        error: 'SEATS_UNAVAILABLE',
        message: 'Selected travel class is currently sold out for this date.',
      });
    }

    // 4. Calculate server-side total
    const fare = await railwayProvider.getFare(trainId, classCode, sourceStationCode, destStationCode);
    const count = passengers.length;
    const baseTotal = fare.baseAmount * count;
    const resTotal = fare.reservationFee * count;
    const sfTotal = fare.superfastCharge * count;
    const subtotal = baseTotal + resTotal + sfTotal;
    const taxes = fare.taxAmount * count;
    const totalAmount = Math.round((subtotal + taxes) * 100) / 100;

    // 5. Generate unique booking reference (e.g. RC-BKG-849201)
    const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const publicReference = `RC-BKG-${randomSuffix}`;

    // 6. Map passengers
    const isSuburban = className.includes('Suburban') || className.includes('Local') || className.includes('EMU') || classCode === 'II' || classCode === 'FC' || classCode === 'AC';
    const coachPrefix = isSuburban
      ? (classCode === 'AC' ? 'AC-D2' : classCode === 'FC' ? 'FC-1' : 'GEN')
      : (classCode === 'CC' ? 'C2' : classCode === 'EC' ? 'E1' : classCode === '1A' ? 'H1' : classCode === '2A' ? 'A1' : 'B3');

    const mappedPassengers: Passenger[] = passengers.map((p, idx) => ({
      id: `psg_${bookingId}_${idx}`,
      bookingId,
      name: p.name.trim(),
      age: Number(p.age),
      gender: p.gender || 'Other',
      berthPreference: isSuburban ? 'Suburban Seat' : (p.berthPreference || 'No Preference'),
      coach: coachPrefix,
      seatNumber: isSuburban ? `${coachPrefix} (Unreserved/Open Seating)` : `${coachPrefix}-${Math.floor(10 + Math.random() * 50) + idx}`,
    }));

    const newBooking: Booking = {
      id: bookingId,
      publicReference,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      trainId,
      trainNumber: trainNumber || '12002',
      trainName: trainName || 'Express',
      sourceStationCode,
      sourceStationName: sourceStationName || sourceStationCode,
      destStationCode,
      destStationName: destStationName || destStationCode,
      departureTime: departureTime || '06:00',
      arrivalTime: arrivalTime || '12:00',
      journeyDate,
      classCode,
      className: className || classCode,
      status: 'PENDING_PAYMENT',
      passengers: mappedPassengers,
      fareBreakdown: {
        baseFare: baseTotal,
        reservationCharge: resTotal,
        superfastFee: sfTotal,
        taxes,
        discount: 0,
        totalAmount,
      },
      currency: 'INR',
      idempotencyKey,
      providerPnr: null, // As required by specifications, providerPnr stays null unless supplied by authorized provider
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.set(newBooking.id, newBooking);

    db.logAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'BOOKING_CREATE',
      resourceType: 'Booking',
      resourceId: newBooking.id,
      requestId: req.requestId,
      details: { publicReference, totalAmount, passengersCount: count },
    });

    return res.status(201).json({
      success: true,
      booking: newBooking,
      message: 'Booking created in PENDING_PAYMENT status. Proceed to payment.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET /api/bookings
bookingsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let bookings = Array.from(db.bookings.values());

  // Non-admins only see their own bookings
  if (user.role !== 'ADMIN') {
    bookings = bookings.filter((b) => b.userId === user.id);
  }

  // Sort descending by creation date
  bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

// GET /api/bookings/:bookingId
bookingsRouter.get('/:bookingId', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { bookingId } = req.params;

  const booking = db.bookings.get(bookingId) ||
    Array.from(db.bookings.values()).find((b) => b.publicReference === bookingId);

  if (!booking) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
  }

  // Enforce ownership: only owner or admin can view
  if (booking.userId !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'You are not authorized to view this booking.' });
  }

  return res.json({
    success: true,
    booking,
  });
});

// POST /api/bookings/:bookingId/cancel
bookingsRouter.post('/:bookingId/cancel', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = db.bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
    }

    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'ALREADY_CANCELLED', message: 'This booking is already cancelled.' });
    }

    // Calculate cancellation fee & refund
    const cancellationFeePerPassenger = 120;
    const totalCancellationFee = Math.min(
      booking.fareBreakdown.totalAmount,
      cancellationFeePerPassenger * booking.passengers.length
    );
    const refundAmount = Math.max(0, booking.fareBreakdown.totalAmount - totalCancellationFee);

    booking.status = 'CANCELLED';
    booking.updatedAt = new Date().toISOString();

    db.bookings.set(booking.id, booking);

    db.logAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'BOOKING_CANCEL',
      resourceType: 'Booking',
      resourceId: booking.id,
      requestId: req.requestId,
      details: { refundAmount, cancellationFee: totalCancellationFee, reason },
    });

    return res.json({
      success: true,
      booking,
      cancellation: {
        status: 'CANCELLED',
        cancellationFee: totalCancellationFee,
        refundAmount,
        currency: booking.currency,
        message: `Booking ${booking.publicReference} has been successfully cancelled. Refund of ₹${refundAmount} initiated to original payment method.`,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});
