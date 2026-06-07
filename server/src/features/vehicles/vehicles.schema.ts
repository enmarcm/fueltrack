import { z } from 'zod';
import { FuelType } from '@prisma/client';

export const createVehicleSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  tankCapacity: z.number().positive().optional(),
  odometer: z.number().min(0).optional(),
  color: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
