import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function listFuelEntries(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const entries = await prisma.fuelEntry.findMany({
    where: { vehicleId: req.params.vehicleId as string },
    orderBy: { date: 'desc' },
  });

  res.json({ success: true, data: entries });
}

export async function getFuelEntry(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const entry = await prisma.fuelEntry.findFirst({
    where: { id: req.params.entryId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!entry) {
    res.status(404).json({ success: false, error: 'Fuel entry not found' });
    return;
  }

  res.json({ success: true, data: entry });
}

export async function createFuelEntry(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const entry = await prisma.fuelEntry.create({
    data: { ...req.body, vehicleId: req.params.vehicleId as string },
  });

  if (req.body.odometer > vehicle.odometer) {
    await prisma.vehicle.update({
      where: { id: req.params.vehicleId as string },
      data: { odometer: req.body.odometer },
    });
  }

  res.status(201).json({ success: true, data: entry });
}

export async function updateFuelEntry(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const existing = await prisma.fuelEntry.findFirst({
    where: { id: req.params.entryId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Fuel entry not found' });
    return;
  }

  const entry = await prisma.fuelEntry.update({
    where: { id: req.params.entryId as string },
    data: req.body,
  });

  res.json({ success: true, data: entry });
}

export async function deleteFuelEntry(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const existing = await prisma.fuelEntry.findFirst({
    where: { id: req.params.entryId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Fuel entry not found' });
    return;
  }

  await prisma.fuelEntry.delete({ where: { id: req.params.entryId as string } });
  res.json({ success: true, data: null });
}
