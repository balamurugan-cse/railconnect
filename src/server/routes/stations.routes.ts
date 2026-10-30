import { Router } from 'express';
import { db } from '../db/store.js';

export const stationsRouter = Router();

// GET /api/stations?query=
stationsRouter.get('/', (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim().toLowerCase() : '';

  const allStations = Array.from(db.stations.values()).filter((s) => s.active);

  if (!query) {
    // Return all or default set
    return res.json({
      stations: allStations.slice(0, 20),
    });
  }

  // Filter by code, name, city, or state
  const matched = allStations.filter(
    (s) =>
      s.code.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query) ||
      s.state.toLowerCase().includes(query)
  );

  // Exact code matches rank highest
  matched.sort((a, b) => {
    if (a.code.toLowerCase() === query) return -1;
    if (b.code.toLowerCase() === query) return 1;
    if (a.name.toLowerCase().startsWith(query)) return -1;
    if (b.name.toLowerCase().startsWith(query)) return 1;
    return a.name.localeCompare(b.name);
  });

  return res.json({
    stations: matched.slice(0, 15),
  });
});

// GET /api/stations/popular
stationsRouter.get('/popular', (_req, res) => {
  const popularCodes = ['NDLS', 'MMCT', 'SBC', 'MAS', 'HWH', 'ADI', 'HYB', 'PNBE'];
  const stations = popularCodes
    .map((code) => Array.from(db.stations.values()).find((s) => s.code === code))
    .filter(Boolean);

  return res.json({ stations });
});

// GET /api/stations/chennai-suburban
stationsRouter.get('/chennai-suburban', (_req, res) => {
  const chennaiCodes = ['MSB', 'MS', 'MASS', 'MBM', 'GDY', 'TLM', 'TBM', 'CGL', 'VLCY', 'MCPT', 'MTMY', 'TYMR', 'TRMN', 'PER', 'AVD', 'TRL', 'AJJ', 'GPD'];
  const stations = chennaiCodes
    .map((code) => Array.from(db.stations.values()).find((s) => s.code === code))
    .filter(Boolean);

  return res.json({ stations });
});
