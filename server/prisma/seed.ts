import { PrismaClient, FuelType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@fueltrack.app' },
    update: {},
    create: {
      email: 'demo@fueltrack.app',
      password: passwordHash,
      name: 'Usuario Demo',
    },
  });

  const sedan = await prisma.vehicle.upsert({
    where: { id: 'vehicle-sedan-001' },
    update: {},
    create: {
      id: 'vehicle-sedan-001',
      userId: user.id,
      name: 'Sedán Diario',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      fuelType: FuelType.GASOLINA,
      tankCapacity: 50,
      odometer: 45230,
      color: '#2563EB',
    },
  });

  const suv = await prisma.vehicle.upsert({
    where: { id: 'vehicle-suv-001' },
    update: {},
    create: {
      id: 'vehicle-suv-001',
      userId: user.id,
      name: 'SUV Viajes',
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      fuelType: FuelType.GASOLINA,
      tankCapacity: 57,
      odometer: 18340,
      color: '#EA580C',
    },
  });

  const sedanFuelEntries = [
    { date: new Date('2025-10-01'), odometer: 41200, liters: 45, pricePerLiter: 23.5, totalCost: 1057.5, isFullTank: true, station: 'Pemex Centro' },
    { date: new Date('2025-10-12'), odometer: 41680, liters: 42, pricePerLiter: 23.8, totalCost: 999.6, isFullTank: true, station: 'Pemex Norte' },
    { date: new Date('2025-10-25'), odometer: 42150, liters: 44, pricePerLiter: 24.0, totalCost: 1056.0, isFullTank: true, station: 'Shell Sur' },
    { date: new Date('2025-11-08'), odometer: 42600, liters: 43, pricePerLiter: 24.2, totalCost: 1040.6, isFullTank: true, station: 'Pemex Centro' },
    { date: new Date('2025-11-22'), odometer: 43080, liters: 41, pricePerLiter: 24.5, totalCost: 1004.5, isFullTank: true, station: 'BP Norte' },
    { date: new Date('2025-12-06'), odometer: 43550, liters: 45, pricePerLiter: 24.3, totalCost: 1093.5, isFullTank: true, station: 'Pemex Centro' },
    { date: new Date('2025-12-20'), odometer: 44010, liters: 42, pricePerLiter: 24.8, totalCost: 1041.6, isFullTank: true, station: 'Shell Sur' },
    { date: new Date('2026-01-05'), odometer: 44480, liters: 44, pricePerLiter: 25.0, totalCost: 1100.0, isFullTank: true, station: 'Pemex Norte' },
    { date: new Date('2026-01-19'), odometer: 44950, liters: 43, pricePerLiter: 25.2, totalCost: 1083.6, isFullTank: true, station: 'BP Centro' },
    { date: new Date('2026-02-02'), odometer: 45230, liters: 40, pricePerLiter: 25.0, totalCost: 1000.0, isFullTank: false, station: 'Pemex Centro' },
  ];

  const suvFuelEntries = [
    { date: new Date('2025-11-01'), odometer: 15800, liters: 50, pricePerLiter: 23.5, totalCost: 1175.0, isFullTank: true, station: 'Pemex Sur' },
    { date: new Date('2025-11-18'), odometer: 16320, liters: 48, pricePerLiter: 24.0, totalCost: 1152.0, isFullTank: true, station: 'Shell Norte' },
    { date: new Date('2025-12-05'), odometer: 16850, liters: 52, pricePerLiter: 24.3, totalCost: 1263.6, isFullTank: true, station: 'Pemex Centro' },
    { date: new Date('2025-12-22'), odometer: 17360, liters: 49, pricePerLiter: 24.8, totalCost: 1215.2, isFullTank: true, station: 'BP Sur' },
    { date: new Date('2026-01-10'), odometer: 17880, liters: 51, pricePerLiter: 25.0, totalCost: 1275.0, isFullTank: true, station: 'Pemex Norte' },
    { date: new Date('2026-02-01'), odometer: 18340, liters: 47, pricePerLiter: 25.2, totalCost: 1184.4, isFullTank: false, station: 'Shell Centro' },
  ];

  for (const entry of sedanFuelEntries) {
    await prisma.fuelEntry.create({
      data: { ...entry, vehicleId: sedan.id },
    });
  }

  for (const entry of suvFuelEntries) {
    await prisma.fuelEntry.create({
      data: { ...entry, vehicleId: suv.id },
    });
  }

  console.log('Seed completed!');
  console.log('  User: demo@fueltrack.app / demo123');
  console.log(`  Vehicles: ${sedan.name}, ${suv.name}`);
  console.log(`  Fuel entries: ${sedanFuelEntries.length + suvFuelEntries.length} total`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
