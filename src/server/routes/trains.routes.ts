import { Router } from 'express';
import { db } from '../db/store.js';
import { AuthorizedRailwayProvider } from '../providers/railway/AuthorizedRailwayProvider.js';
import { DemoRailwayProvider } from '../providers/railway/DemoRailwayProvider.js';
import { RailwayProvider } from '../providers/railway/RailwayProvider.js';

export const trainsRouter = Router();

// Resolve active provider according to config
const isAuthorizedMode = process.env.RAILWAY_PROVIDER_MODE === 'authorized';
const railwayProvider: RailwayProvider = isAuthorizedMode
  ? new AuthorizedRailwayProvider()
  : new DemoRailwayProvider();

// GET /api/trains/search?from=&to=&date=&passengers=&class=
trainsRouter.get('/search', async (req, res) => {
  try {
    const from = typeof req.query.from === 'string' ? req.query.from.trim().toUpperCase() : '';
    const to = typeof req.query.to === 'string' ? req.query.to.trim().toUpperCase() : '';
    const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';
    const passengers = parseInt(req.query.passengers as string, 10) || 1;
    const classCode = typeof req.query.class === 'string' ? req.query.class.trim() : undefined;

    if (!from || !to) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Origin station (from) and Destination station (to) are required.',
      });
    }

    if (from === to) {
      return res.status(400).json({
        error: 'INVALID_STATIONS',
        message: 'Source and destination stations cannot be the same.',
      });
    }

    if (!date) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Travel date is required.',
      });
    }

    // Validate that journey date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({
        error: 'INVALID_DATE',
        message: 'Journey date cannot be in the past.',
      });
    }

    const trains = await railwayProvider.searchTrains({
      fromStationCode: from,
      toStationCode: to,
      journeyDate: date,
      passengerCount: passengers,
      classCode,
    });

    return res.json({
      success: true,
      meta: {
        from,
        to,
        date,
        passengers,
        classCode: classCode || 'ALL',
        resultCount: trains.length,
        sourceMode: isAuthorizedMode ? 'LIVE' : 'DEMO',
        providerNotice: isAuthorizedMode
          ? 'Live confirmed railway inventory.'
          : 'DEMO — not live railway data. Sample data for development and prototype demonstration.',
        timestamp: new Date().toISOString(),
      },
      trains,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'SEARCH_FAILED',
      message: err.message || 'Failed to search trains.',
    });
  }
});

// GET /api/trains/:trainId
trainsRouter.get('/:trainId', async (req, res) => {
  try {
    const { trainId } = req.params;
    const details = await railwayProvider.getTrainDetails(trainId);

    if (!details) {
      return res.status(404).json({
        error: 'TRAIN_NOT_FOUND',
        message: `Train with ID "${trainId}" could not be found.`,
      });
    }

    return res.json({
      success: true,
      train: details,
      sourceMode: isAuthorizedMode ? 'LIVE' : 'DEMO',
      notice: isAuthorizedMode ? undefined : 'DEMO — not live railway data',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET /api/trains/:trainId/availability?date=&class=
trainsRouter.get('/:trainId/availability', async (req, res) => {
  try {
    const { trainId } = req.params;
    const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';
    const classCode = typeof req.query.class === 'string' ? req.query.class.trim() : '3A';

    if (!date) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Journey date is required.' });
    }

    const availability = await railwayProvider.getAvailability(trainId, date, classCode);

    return res.json({
      success: true,
      availability,
      sourceMode: availability.sourceMode,
      notice: availability.sourceMode === 'DEMO' ? 'DEMO — not live railway data' : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// GET /api/trains/live-status/:trainNumber
trainsRouter.get('/status/live/:trainNumber', (req, res) => {
  const { trainNumber } = req.params;
  const train = Array.from(db.trains.values()).find((t) => t.trainNumber === trainNumber);

  if (!train) {
    return res.status(404).json({
      error: 'TRAIN_NOT_FOUND',
      message: `No train found with number ${trainNumber}.`,
    });
  }

  const stops = Array.from(db.trainStops.values())
    .filter((s) => s.trainId === train.id)
    .sort((a, b) => a.sequence - b.sequence);

  // Simulate current running status
  const currentStopIndex = Math.min(Math.floor(stops.length / 2), stops.length - 1);
  const currentStop = stops[currentStopIndex];
  const nextStop = stops[Math.min(currentStopIndex + 1, stops.length - 1)];

  return res.json({
    success: true,
    trainNumber: train.trainNumber,
    trainName: train.name,
    currentStatus: 'RUNNING ON TIME',
    delayMinutes: 0,
    currentStation: currentStop.stationName,
    currentStationCode: currentStop.stationCode,
    nextStation: nextStop.stationName,
    nextStationCode: nextStop.stationCode,
    speedKmH: 115,
    distanceCoveredKm: currentStop.distanceKm || 440,
    totalDistanceKm: stops[stops.length - 1].distanceKm || 1000,
    stops: stops.map((s, idx) => ({
      stationName: s.stationName,
      stationCode: s.stationCode,
      scheduledArrival: s.arrivalTime,
      scheduledDeparture: s.departureTime,
      actualArrival: s.arrivalTime,
      actualDeparture: s.departureTime,
      platform: s.platform,
      status: idx < currentStopIndex ? 'DEPARTED' : idx === currentStopIndex ? 'CURRENT' : 'UPCOMING',
      delayMinutes: 0,
    })),
    sourceMode: 'DEMO',
    notice: 'DEMO — simulated live running status for testing.',
    updatedAt: new Date().toISOString(),
  });
});

// GET /api/pnr/:pnrNumber
trainsRouter.get('/status/pnr/:pnrNumber', (req, res) => {
  const pnr = req.params.pnrNumber.trim().toUpperCase();

  // Check if it matches a platform booking reference (e.g. RC-BKG-849201)
  const booking = Array.from(db.bookings.values()).find(
    (b) => b.publicReference.toUpperCase() === pnr || b.id.toUpperCase() === pnr
  );

  if (booking) {
    return res.json({
      success: true,
      referenceType: 'PLATFORM_BOOKING',
      reference: booking.publicReference,
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      sourceStation: booking.sourceStationName,
      destStation: booking.destStationName,
      journeyDate: booking.journeyDate,
      bookingStatus: booking.status,
      classCode: booking.classCode,
      passengers: booking.passengers.map((p) => ({
        name: p.name,
        coach: p.coach || 'B2',
        seatNumber: p.seatNumber || 'B2-14',
        status: booking.status === 'CONFIRMED' ? 'CNF' : booking.status,
      })),
      providerPnr: booking.providerPnr,
      sourceMode: 'DEMO',
      notice: 'DEMO — not live railway data. Booking found in RailConnect platform records.',
    });
  }

  // Generate simulated PNR query response for any 10-digit demo number
  if (/^\d{10}$/.test(pnr)) {
    return res.json({
      success: true,
      referenceType: 'DEMO_RAILWAY_PNR',
      reference: pnr,
      trainNumber: '12952',
      trainName: 'Mumbai Tejas Rajdhani Express',
      sourceStation: 'New Delhi (NDLS)',
      destStation: 'Mumbai Central (MMCT)',
      journeyDate: '2026-11-10',
      bookingStatus: 'CONFIRMED',
      classCode: '3A',
      passengers: [
        { name: 'Passenger 1', coach: 'B4', seatNumber: 'B4-21', status: 'CNF (Confirmed)' },
      ],
      providerPnr: pnr,
      sourceMode: 'DEMO',
      notice: 'DEMO — not live railway data. Simulated response for 10-digit query.',
    });
  }

  return res.status(404).json({
    error: 'PNR_NOT_FOUND',
    message: `No booking or PNR record matching "${pnr}" was found. Try demo booking reference "RC-BKG-849201" or a 10-digit number.`,
  });
});
