import { z } from 'zod';

export const createFuelEntrySchema = z.object({
  date: z.coerce.date().optional(),
  odometer: z.number().min(0),
  liters: z.number().positive(),
  pricePerLiter: z.number().positive(),
  totalCost: z.number().positive(),
  isFullTank: z.boolean().optional(),
  station: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFuelEntrySchema = createFuelEntrySchema.partial();
