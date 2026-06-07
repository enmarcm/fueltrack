import { useQuery } from '@tanstack/react-query';
import { Car, Fuel, TrendingUp, DollarSign, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useVehicleStore } from '@/stores/vehicleStore';
import api from '@/lib/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeVehicleId, setActiveVehicle } = useVehicleStore();

  const { data: vehicles, isLoading: vLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/api/vehicles').then((r) => r.data.data),
  });

  const vehicleId = activeVehicleId || vehicles?.[0]?.id;

  const { data: statsData, isLoading: sLoading } = useQuery({
    queryKey: ['stats', vehicleId],
    queryFn: () => api.get(`/api/stats/${vehicleId}`).then((r) => r.data.data),
    enabled: !!vehicleId,
  });

  const { data: vehicleData } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => api.get(`/api/vehicles/${vehicleId}`).then((r) => r.data.data),
    enabled: !!vehicleId,
  });

  const currentVehicle = vehicles?.find((v: any) => v.id === vehicleId);
  const isLoading = vLoading || sLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {currentVehicle && (
            <p className="text-muted-foreground flex items-center gap-1">
              <Car className="h-3 w-3" /> {currentVehicle.name} · {currentVehicle.odometer?.toLocaleString()} km
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/rutas/nueva')}>
          <Route className="h-4 w-4 mr-1" /> Nueva ruta
        </Button>
      </div>

      {!vehicleId ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Crea tu primer vehículo</p>
          <p className="text-sm mb-4">Para ver el dashboard, necesitas al menos un vehículo</p>
          <Button onClick={() => navigate('/vehiculos')}>Ir a vehículos</Button>
        </div>
      ) : (
        <>
          {vehicles?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {vehicles.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVehicle(v.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    vehicleId === v.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              icon={<Fuel className="h-4 w-4" />}
              label="Rendimiento"
              value={isLoading ? null : `${(statsData?.efficiency?.avgKmPerLiter || 0).toFixed(1)} km/L`}
              loading={isLoading}
              highlight={(statsData?.efficiency?.avgKmPerLiter || 0) > 12 ? 'text-green-600' : (statsData?.efficiency?.avgKmPerLiter || 0) > 0 ? 'text-blue-600' : ''}
            />
            <KpiCard
              icon={<DollarSign className="h-4 w-4" />}
              label="Costo/km"
              value={isLoading ? null : `$${(statsData?.costPerKm || 0).toFixed(2)}`}
              loading={isLoading}
              highlight="text-orange-500"
            />
            <KpiCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Gasto del mes"
              value={isLoading ? null : {
                text: `$${((statsData?.monthlySpending?.slice(-1)?.[0]?.totalCost) || 0).toFixed(0)}`,
              }}
              loading={isLoading}
              highlight="text-green-600"
            />
            <KpiCard
              icon={<Car className="h-4 w-4" />}
              label="Próximo tanqueo"
              value={isLoading ? null : {
                text: statsData?.nextRefuel ? `~${statsData.nextRefuel.daysUntil} días` : '—',
              }}
              loading={isLoading}
              highlight="text-purple-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gasto mensual</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !statsData?.monthlySpending?.length ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Sin datos de gasto</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={statsData.monthlySpending.map((d: any) => ({ ...d, label: `${d.month}/${d.year}` }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="totalCost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rendimiento por tanqueo</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !statsData?.efficiency?.lastEntries?.length ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Necesitas al menos 2 tanqueos "tanque lleno"</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statsData.efficiency.lastEntries.map((d: any, i: number) => ({ ...d, name: `#${statsData.efficiency.lastEntries.length - i}` }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {vehicleData?.fuelEntries?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos tanqueos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vehicleData.fuelEntries.slice(0, 5).map((entry: any) => {
                    const prev = vehicleData.fuelEntries.find((e: any) => e.id !== entry.id && e.date < entry.date);
                    const eff = prev && entry.isFullTank ? ((entry.odometer - prev.odometer) / entry.liters).toFixed(1) : null;
                    return (
                      <div key={entry.id} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm">
                        <div>
                          <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground text-xs">{entry.liters}L · ${entry.pricePerLiter}/L</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${entry.totalCost.toFixed(2)}</p>
                          {eff && <p className="text-xs text-green-600">{eff} km/L</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, loading, highlight }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          <span className={highlight}>{icon}</span>
          {label}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20 mt-1" />
        ) : (
          <p className={`text-xl font-bold ${highlight || ''}`}>{value?.text || value}</p>
        )}
      </CardContent>
    </Card>
  );
}
