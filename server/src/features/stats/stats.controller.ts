import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import {
  calculateEfficiency,
  calculateCostPerKm,
  calculateMonthlySpending,
  calculateRefuelFrequency,
  estimateNextRefuel,
} from './stats.service';

export async function getVehicleStats(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const [efficiency, costPerKm, monthlySpending, refuelFrequency, nextRefuel] = await Promise.all([
    calculateEfficiency(req.params.id as string),
    calculateCostPerKm(req.params.id as string),
    calculateMonthlySpending(req.params.id as string),
    calculateRefuelFrequency(req.params.id as string),
    estimateNextRefuel(req.params.id as string),
  ]);

  res.json({
    success: true,
    data: {
      efficiency,
      costPerKm,
      monthlySpending,
      refuelFrequency,
      nextRefuel,
    },
  });
}

export async function getOverviewStats(req: Request, res: Response) {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.userId },
    select: { id: true, name: true, color: true, odometer: true },
  });

  const overviews = await Promise.all(
    vehicles.map(async (v) => {
      const [efficiency, costPerKm, monthlySpending, refuelFrequency] = await Promise.all([
        calculateEfficiency(v.id),
        calculateCostPerKm(v.id),
        calculateMonthlySpending(v.id),
        calculateRefuelFrequency(v.id),
      ]);
      return { ...v, efficiency, costPerKm, monthlySpending, refuelFrequency };
    })
  );

  res.json({ success: true, data: overviews });
}
