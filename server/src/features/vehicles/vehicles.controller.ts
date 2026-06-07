import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function listVehicles(req: Request, res: Response) {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.userId },
    include: {
      fuelEntries: { orderBy: { date: 'desc' }, take: 1 },
      _count: { select: { fuelEntries: true, trips: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: vehicles });
}

export async function getVehicle(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
    include: { fuelEntries: { orderBy: { date: 'desc' }, take: 5 } },
  });

  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  res.json({ success: true, data: vehicle });
}

export async function createVehicle(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.create({
    data: { ...req.body, userId: req.userId! },
  });

  res.status(201).json({ success: true, data: vehicle });
}

export async function updateVehicle(req: Request, res: Response) {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id as string },
    data: req.body,
  });

  res.json({ success: true, data: vehicle });
}

export async function deleteVehicle(req: Request, res: Response) {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  await prisma.vehicle.delete({ where: { id: req.params.id as string } });
  res.json({ success: true, data: null });
}
