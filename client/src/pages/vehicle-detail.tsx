import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Fuel, Plus, History, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    odometer: '', liters: '', pricePerLiter: '', totalCost: '',
    station: '', isFullTank: true, notes: '',
  });

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => api.get(`/api/vehicles/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: fuelEntries } = useQuery({
    queryKey: ['fuel-entries', id],
    queryFn: () => api.get(`/api/vehicles/${id}/fuel`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => api.get(`/api/stats/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const createFuelMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/vehicles/${id}/fuel`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-entries', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
      setFuelDialogOpen(false);
      setFuelForm({ odometer: '', liters: '', pricePerLiter: '', totalCost: '', station: '', isFullTank: true, notes: '' });
      toast({ title: 'Tanqueo registrado' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.error || 'Error al registrar', variant: 'destructive' });
    },
  });

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const liters = parseFloat(fuelForm.liters);
    const pricePerLiter = parseFloat(fuelForm.pricePerLiter);
    const totalCost = fuelForm.totalCost ? parseFloat(fuelForm.totalCost) : liters * pricePerLiter;
    createFuelMutation.mutate({
      odometer: parseFloat(fuelForm.odometer),
      liters,
      pricePerLiter,
      totalCost,
      station: fuelForm.station || undefined,
      isFullTank: fuelForm.isFullTank,
      notes: fuelForm.notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const avgEfficiency = stats?.efficiency?.avgKmPerLiter;
  const monthlyCost = stats?.monthlySpending?.slice(-1)?.[0]?.totalCost;
  const nextRefuel = stats?.nextRefuel;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: vehicle?.color || '#2563EB' }}>
          {vehicle?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{vehicle?.name}</h1>
          <p className="text-muted-foreground">
            {[vehicle?.brand, vehicle?.model, vehicle?.year].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Rendimiento</p>
            <p className="text-xl font-bold text-blue-600">{avgEfficiency ? `${avgEfficiency.toFixed(1)} km/L` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Gasto del mes</p>
            <p className="text-xl font-bold text-orange-500">{monthlyCost ? `$${monthlyCost.toFixed(0)}` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Odómetro</p>
            <p className="text-xl font-bold">{vehicle?.odometer?.toLocaleString()} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Próximo tanqueo</p>
            <p className="text-xl font-bold text-purple-600">{nextRefuel ? `~${nextRefuel.daysUntil}d` : '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" /> Tanqueos
          </CardTitle>
          <Dialog open={fuelDialogOpen} onOpenChange={setFuelDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Registrar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar tanqueo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="f-odo">Odómetro (km) *</Label>
                  <Input id="f-odo" type="number" value={fuelForm.odometer} onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="f-liters">Litros *</Label>
                    <Input id="f-liters" type="number" step="0.01" value={fuelForm.liters} onChange={(e) => {
                      const liters = e.target.value;
                      const price = parseFloat(fuelForm.pricePerLiter) || 0;
                      setFuelForm({ ...fuelForm, liters, totalCost: liters && price ? (parseFloat(liters) * price).toFixed(2) : '' });
                    }} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="f-price">Precio/L *</Label>
                    <Input id="f-price" type="number" step="0.01" value={fuelForm.pricePerLiter} onChange={(e) => {
                      const price = e.target.value;
                      const liters = parseFloat(fuelForm.liters) || 0;
                      setFuelForm({ ...fuelForm, pricePerLiter: price, totalCost: liters && price ? (liters * parseFloat(price)).toFixed(2) : '' });
                    }} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="f-total">Total ($)</Label>
                  <Input id="f-total" type="number" step="0.01" value={fuelForm.totalCost} onChange={(e) => setFuelForm({ ...fuelForm, totalCost: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="f-station">Estación</Label>
                  <Input id="f-station" value={fuelForm.station} onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })} placeholder="Pemex, Shell..." />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="f-full">Tanque lleno</Label>
                  <Switch id="f-full" checked={fuelForm.isFullTank} onCheckedChange={(c) => setFuelForm({ ...fuelForm, isFullTank: c })} />
                </div>
                <Button type="submit" className="w-full" disabled={createFuelMutation.isPending}>
                  {createFuelMutation.isPending ? 'Guardando...' : 'Registrar tanqueo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {!fuelEntries?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin tanqueos registrados</p>
          ) : (
            <div className="space-y-2">
              {fuelEntries.map((entry: any) => {
                const prevIndex = fuelEntries.findIndex((e: any) => e.id === entry.id) + 1;
                const prev = fuelEntries[prevIndex];
                const eff = prev && entry.isFullTank && prev.isFullTank
                  ? ((prev.odometer - entry.odometer) / entry.liters).toFixed(1)
                  : null;
                return (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">{entry.liters}L · ${entry.pricePerLiter}/L · {entry.station || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${entry.totalCost.toFixed(2)}</p>
                      {eff && <p className="text-xs text-green-600">{eff} km/L</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
