import { z } from 'zod';

export const createTripSchema = z.object({
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  distanceKm: z.number().min(0).optional(),
  durationSec: z.number().int().min(0).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  path: z.any().optional(),
  source: z.enum(['gps', 'manual', 'import']).optional(),
  notes: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial();
