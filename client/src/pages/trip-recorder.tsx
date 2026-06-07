import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Route, Play, Square, Navigation, Clock, MapPin, Car, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVehicleStore } from '@/stores/vehicleStore';
import MapaRuta from '@/components/mapa-ruta';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Point {
  lat: number;
  lng: number;
  t: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGPX(xml: string): Point[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const trkpts = doc.querySelectorAll('trkpt');
  const points: Point[] = [];
  trkpts.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lng = parseFloat(pt.getAttribute('lon') || '0');
    const timeEl = pt.querySelector('time');
    const t = timeEl ? new Date(timeEl.textContent || '').getTime() : Date.now();
    if (lat && lng) points.push({ lat, lng, t });
  });
  return points;
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

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TripRecorderPage() {
  const navigate = useNavigate();
  const { activeVehicleId } = useVehicleStore();
  const [recording, setRecording] = useState(false);
  const [path, setPath] = useState<Point[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [currentPosition, setCurrentPosition] = useState<Point | null>(null);
  const watchId = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const wakeLockRef = useRef<any>(null);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/api/vehicles').then((r) => r.data.data),
  });

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  const startRecording = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setError('');
    setPath([]);
    setDistance(0);
    setDuration(0);
    setCurrentPosition(null);
    startTime.current = Date.now();
    setRecording(true);

    requestWakeLock();

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: Point = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
        setCurrentPosition(point);
        setPath((prev) => {
          const newPath = [...prev, point];
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            setDistance((d) => d + haversine(last.lat, last.lng, point.lat, point.lng));
          }
          return newPath;
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permiso de ubicación denegado. Actívalo en la configuración del navegador.');
          stopRecording();
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
  };

  const stopRecording = async () => {
    setRecording(false);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }

    if (path.length < 2) {
      toast({ title: 'Viaje muy corto', description: 'No se registraron suficientes puntos' });
      return;
    }

    const vehicleId = activeVehicleId || vehicles?.[0]?.id;
    if (!vehicleId) {
      toast({ title: 'Error', description: 'Selecciona un vehículo primero', variant: 'destructive' });
      return;
    }

    try {
      const origin = `${path[0].lat.toFixed(4)}, ${path[0].lng.toFixed(4)}`;
      const destination = `${path[path.length - 1].lat.toFixed(4)}, ${path[path.length - 1].lng.toFixed(4)}`;
      await api.post(`/api/vehicles/${vehicleId}/trips`, {
        startedAt: new Date(startTime.current),
        endedAt: new Date(),
        distanceKm: parseFloat(distance.toFixed(2)),
        durationSec: duration,
        origin: `Inicio: ${origin}`,
        destination: `Fin: ${destination}`,
        path: JSON.stringify(path),
        source: 'gps',
      });
      toast({ title: 'Viaje guardado', description: `${distance.toFixed(1)} km en ${formatDuration(duration)}` });
      navigate('/rutas');
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el viaje', variant: 'destructive' });
    }
  };

  const handleImportGPX = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gpx,.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const points = parseGPX(text);
      if (points.length < 2) {
        toast({ title: 'GPX inválido', description: 'El archivo no contiene suficientes puntos', variant: 'destructive' });
        return;
      }
      setPath(points);
      let totalDist = 0;
      for (let i = 1; i < points.length; i++) {
        totalDist += haversine(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
      }
      setDistance(totalDist);
      if (points[0].t && points[points.length - 1].t) {
        startTime.current = points[0].t;
        setDuration(Math.floor((points[points.length - 1].t - points[0].t) / 1000));
      }
      toast({ title: 'Ruta importada', description: `${points.length} puntos · ${totalDist.toFixed(1)} km` });
    };
    input.click();
  };

  const handleExportGPX = () => {
    if (path.length < 2) return;
    const gpx = exportGPX(path);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruta-${new Date().toISOString().slice(0, 10)}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <Route className="h-4 w-4 mr-1" /> Volver
        </Button>
        {path.length >= 2 && !recording && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportGPX}>
              <Upload className="h-4 w-4 mr-1 rotate-180" /> Exportar GPX
            </Button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold">Registrar ruta</h1>

      <div className="grid grid-cols-1 gap-4">
        <Card className={`${recording ? 'ring-2 ring-red-500' : ''}`}>
          <CardContent className="p-4 sm:p-8 space-y-4">
            {error ? (
              <div className="space-y-4 text-center">
                <Navigation className="h-12 w-12 mx-auto text-destructive" />
                <p className="text-destructive font-medium">{error}</p>
                <Button variant="outline" onClick={startRecording}>Reintentar</Button>
              </div>
            ) : recording ? (
              <div className="space-y-4 text-center">
                <Navigation className="h-12 w-12 mx-auto text-red-500 animate-bounce" />
                <p className="text-lg font-bold text-red-500">Grabando...</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{distance.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">km</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{formatDuration(duration)}</p>
                    <p className="text-sm text-muted-foreground">tiempo</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Puntos GPS: {path.length}</p>
                <Button variant="destructive" size="lg" className="w-full" onClick={stopRecording}>
                  <Square className="h-5 w-5 mr-2" /> Finalizar viaje
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <MapPin className="h-12 w-12 mx-auto text-primary" />
                <p className="text-muted-foreground">Presiona iniciar para grabar tu ruta con GPS, o importa un archivo GPX</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="flex-1" onClick={startRecording}>
                    <Play className="h-5 w-5 mr-2" /> Iniciar viaje
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={handleImportGPX}>
                    <Upload className="h-5 w-5 mr-2" /> Importar GPX
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[300px] sm:h-[400px]">
          <MapaRuta
            path={path}
            currentPosition={currentPosition}
            className="h-full w-full rounded-none"
          />
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Vehículo activo</p>
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 shrink-0" />
              {vehicles?.find((v: any) => v.id === activeVehicleId)?.name || vehicles?.[0]?.name || 'Sin vehículo'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
