import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function listAllTrips(req: Request, res: Response) {
  const trips = await prisma.trip.findMany({
    where: { vehicle: { userId: req.userId } },
    orderBy: { startedAt: 'desc' },
    include: { vehicle: { select: { id: true, name: true, color: true } } },
  });

  res.json({ success: true, data: trips });
}

export async function listTrips(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const trips = await prisma.trip.findMany({
    where: { vehicleId: req.params.vehicleId as string },
    orderBy: { startedAt: 'desc' },
  });

  res.json({ success: true, data: trips });
}

export async function getTrip(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const trip = await prisma.trip.findFirst({
    where: { id: req.params.tripId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found' });
    return;
  }

  res.json({ success: true, data: trip });
}

export async function createTrip(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const trip = await prisma.trip.create({
    data: { ...req.body, vehicleId: req.params.vehicleId as string },
  });

  res.status(201).json({ success: true, data: trip });
}

export async function updateTrip(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const existing = await prisma.trip.findFirst({
    where: { id: req.params.tripId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Trip not found' });
    return;
  }

  const trip = await prisma.trip.update({
    where: { id: req.params.tripId as string },
    data: req.body,
  });

  res.json({ success: true, data: trip });
}

export async function deleteTrip(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.vehicleId as string, userId: req.userId },
  });
  if (!vehicle) {
    res.status(404).json({ success: false, error: 'Vehicle not found' });
    return;
  }

  const existing = await prisma.trip.findFirst({
    where: { id: req.params.tripId as string, vehicleId: req.params.vehicleId as string },
  });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Trip not found' });
    return;
  }

  await prisma.trip.delete({ where: { id: req.params.tripId as string } });
  res.json({ success: true, data: null });
}
