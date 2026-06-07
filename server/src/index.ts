import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import authRoutes from './features/auth/auth.routes';
import vehicleRoutes from './features/vehicles/vehicles.routes';
import fuelRoutes from './features/fuel/fuel.routes';
import tripRoutes, { allTripRoutes } from './features/trips/trips.routes';
import statsRoutes from './features/stats/stats.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicles/:vehicleId/fuel', fuelRoutes);
app.use('/api/vehicles/:vehicleId/trips', tripRoutes);
app.use('/api/trips', allTripRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`FuelTrack API running on http://localhost:${env.PORT}`);
});
