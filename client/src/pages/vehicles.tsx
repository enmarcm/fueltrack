import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, Fuel, Gauge, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useVehicleStore } from '@/stores/vehicleStore';
import api from '@/lib/api';

export default function VehiclesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', model: '', year: '', color: '#2563EB', fuelType: 'GASOLINA', odometer: '' });
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/api/vehicles').then((r) => r.data.data),
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { activeVehicleId, setActiveVehicle } = useVehicleStore();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setDialogOpen(false);
      setForm({ name: '', brand: '', model: '', year: '', color: '#2563EB', fuelType: 'GASOLINA', odometer: '' });
      toast({ title: 'Vehículo creado' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Vehículo eliminado' });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: form.name,
      brand: form.brand || undefined,
      model: form.model || undefined,
      year: form.year ? parseInt(form.year) : undefined,
      color: form.color || undefined,
      fuelType: form.fuelType,
      odometer: form.odometer ? parseFloat(form.odometer) : 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo vehículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="v-name">Nombre *</Label>
                <Input id="v-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mi Mazda" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="v-brand">Marca</Label>
                  <Input id="v-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-model">Modelo</Label>
                  <Input id="v-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Corolla" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="v-year">Año</Label>
                  <Input id="v-year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2022" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-odo">Odómetro (km)</Label>
                  <Input id="v-odo" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="45000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-color">Color</Label>
                <input id="v-color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-1" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear vehículo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        [1, 2].map((i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))
      ) : !vehicles?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Sin vehículos</p>
          <p className="text-sm">Crea tu primer vehículo para empezar</p>
        </div>
      ) : (
        vehicles.map((v: any) => (
          <Card
            key={v.id}
            className={`cursor-pointer transition-all ${activeVehicleId === v.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => { setActiveVehicle(v.id); navigate(`/vehiculos/${v.id}`); }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: v.color || '#2563EB' }}>
                  {v.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{v.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {[v.brand, v.model, v.year].filter(Boolean).join(' · ') || 'Sin detalles'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.odometer?.toLocaleString()} km</span>
                    <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{v.fuelType}</span>
                    <span>{v._count?.trips || 0} viajes</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
