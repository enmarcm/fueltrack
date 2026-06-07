import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Route, Play, Clock, MapPin, Download, ChevronDown, ChevronUp, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MapaRuta from '@/components/mapa-ruta';
import api from '@/lib/api';

interface Point {
  lat: number;
  lng: number;
  t: number;
}

interface TripVehicle {
  id: string;
  name: string;
  color?: string;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationSec: number;
  startedAt: string;
  path?: string;
  source?: string;
  vehicle?: TripVehicle;
  vehicleId?: string;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function parsePath(pathStr?: string): Point[] {
  if (!pathStr) return [];
  try {
    return JSON.parse(pathStr);
  } catch {
    return [];
  }
}

function exportGPX(path: Point[]): string {
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><trkseg>\n`;
  path.forEach((p) => {
    gpx += `    <trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.t).toISOString()}</time></trkpt>\n`;
  });
  gpx += `  </trkseg></trk>
</gpx>`;
  return gpx;
}

function TripCard({ trip }: { trip: Trip }) {
  const [expanded, setExpanded] = useState(false);
  const path = parsePath(trip.path);
  const color = trip.vehicle?.color || '#2563EB';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: color }}>
            <Route className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{formatDate(trip.startedAt)}</p>
            <p className="font-medium truncate text-sm mt-0.5">
              {trip.origin?.replace('Inicio: ', '')?.replace(/^([^,]*,[^,]*).*$/, '$1…') || 'Origen desconocido'}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" /> {trip.distanceKm?.toFixed(1)} km
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" /> {formatDuration(trip.durationSec || 0)}
              </span>
              {trip.vehicle && (
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3 shrink-0" /> {trip.vehicle.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-muted-foreground shrink-0 mt-1">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>

        {expanded && path.length >= 2 && (
          <div className="mt-4 space-y-3">
            <div className="h-48 sm:h-64 rounded-lg overflow-hidden border">
              <MapaRuta path={path} className="h-full w-full rounded-none" interactive={false} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                const gpx = exportGPX(path);
                const blob = new Blob([gpx], { type: 'application/gpx+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ruta-${trip.id.slice(0, 8)}.gpx`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Exportar GPX
            </Button>
          </div>
        )}

        {expanded && path.length < 2 && (
          <p className="text-sm text-muted-foreground mt-4 text-center py-4">
            Esta ruta no contiene datos de GPS para mostrar en el mapa.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TripsPage() {
  const navigate = useNavigate();

  const { data: trips, isLoading } = useQuery({
    queryKey: ['all-trips'],
    queryFn: () => api.get('/api/trips').then((r) => r.data.data as Trip[]),
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <Button size="sm" onClick={() => navigate('/rutas/nueva')}>
          <Play className="h-4 w-4 mr-1" /> Nueva ruta
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !trips?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Sin rutas registradas</p>
          <p className="text-sm">Presiona "Nueva ruta" para grabar tu primer viaje con GPS</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
