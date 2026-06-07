import { prisma } from '../../lib/prisma';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculatePathDistance(path: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineKm(path[i - 1].lng, path[i - 1].lat, path[i].lng, path[i].lat);
  }
  return total;
}

export async function calculateEfficiency(vehicleId: string): Promise<{ kmPerLiter: number; avgKmPerLiter: number; lastEntries: { odometer: number; liters: number; efficiency: number | null }[] }> {
  const entries = await prisma.fuelEntry.findMany({
    where: { vehicleId, isFullTank: true },
    orderBy: { date: 'desc' },
    take: 10,
  });

  if (entries.length < 2) {
    return { kmPerLiter: 0, avgKmPerLiter: 0, lastEntries: [] };
  }

  const efficiencies: number[] = [];
  const lastEntries = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i];
    const previous = entries[i + 1];
    const kmDiff = current.odometer - previous.odometer;
    if (kmDiff > 0 && current.liters > 0) {
      const eff = kmDiff / current.liters;
      efficiencies.push(eff);
      lastEntries.push({
        odometer: current.odometer,
        liters: current.liters,
        efficiency: eff,
      });
    }
  }

  const avg = efficiencies.length > 0
    ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
    : 0;

  return {
    kmPerLiter: efficiencies.length > 0 ? efficiencies[0] : 0,
    avgKmPerLiter: avg,
    lastEntries,
  };
}

export async function calculateCostPerKm(vehicleId: string, startDate?: Date, endDate?: Date): Promise<number> {
  const entries = await prisma.fuelEntry.findMany({
    where: {
      vehicleId,
      ...(startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {}),
    },
    orderBy: { date: 'desc' },
    take: 50,
  });

  if (entries.length < 2) return 0;

  const totalCost = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalKm = entries[0].odometer - entries[entries.length - 1].odometer;

  return totalKm > 0 ? totalCost / totalKm : 0;
}

type MonthlySpending = { month: string; year: number; totalCost: number };

export async function calculateMonthlySpending(vehicleId: string): Promise<MonthlySpending[]> {
  const entries = await prisma.fuelEntry.findMany({
    where: { vehicleId },
    orderBy: { date: 'asc' },
  });

  const grouped: Record<string, number> = {};
  for (const entry of entries) {
    const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
    grouped[key] = (grouped[key] || 0) + entry.totalCost;
  }

  return Object.entries(grouped).map(([key, totalCost]) => {
    const [year, month] = key.split('-');
    return { month, year: parseInt(year), totalCost };
  });
}

export async function calculateRefuelFrequency(vehicleId: string): Promise<{ avgDays: number; avgKm: number }> {
  const entries = await prisma.fuelEntry.findMany({
    where: { vehicleId },
    orderBy: { date: 'asc' },
  });

  if (entries.length < 2) return { avgDays: 0, avgKm: 0 };

  let totalDays = 0;
  let totalKm = 0;
  let count = 0;

  for (let i = 1; i < entries.length; i++) {
    const days = (entries[i].date.getTime() - entries[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
    const km = entries[i].odometer - entries[i - 1].odometer;
    if (days > 0 && km > 0) {
      totalDays += days;
      totalKm += km;
      count++;
    }
  }

  return {
    avgDays: count > 0 ? totalDays / count : 0,
    avgKm: count > 0 ? totalKm / count : 0,
  };
}

export async function estimateNextRefuel(vehicleId: string): Promise<{ estimatedOdometer: number; estimatedDate: Date; daysUntil: number; kmUntil: number } | null> {
  const lastEntry = await prisma.fuelEntry.findFirst({
    where: { vehicleId },
    orderBy: { date: 'desc' },
  });

  if (!lastEntry) return null;

  const frequency = await calculateRefuelFrequency(vehicleId);
  if (frequency.avgDays === 0 || frequency.avgKm === 0) return null;

  const estimatedOdometer = lastEntry.odometer + frequency.avgKm;
  const estimatedDate = new Date(lastEntry.date.getTime() + frequency.avgDays * 24 * 60 * 60 * 1000);
  const daysUntil = Math.round((estimatedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const kmUntil = Math.round(frequency.avgKm);

  return {
    estimatedOdometer: Math.round(estimatedOdometer),
    estimatedDate,
    daysUntil: Math.max(0, daysUntil),
    kmUntil,
  };
}
