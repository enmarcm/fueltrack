import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Point {
  lat: number;
  lng: number;
  t?: number;
}

interface MapaRutaProps {
  path: Point[];
  currentPosition?: Point | null;
  className?: string;
  interactive?: boolean;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const currentIcon = L.divIcon({
  className: 'current-position-marker',
  html: `<div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(37,99,235,0.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapaRuta({ path, currentPosition, className = '', interactive = true }: MapaRutaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      attributionControl: true,
    }).setView([-12.0464, -77.0428], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (path.length === 0) return;

    const latlngs = path.map((p) => [p.lat, p.lng] as L.LatLngTuple);
    const polyline = L.polyline(latlngs, {
      color: '#2563EB',
      weight: 4,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polylineRef.current = polyline;

    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    if (path.length >= 2) {
      const first = path[0];
      const last = path[path.length - 1];

      startMarkerRef.current = L.marker([first.lat, first.lng], { icon: defaultIcon })
        .addTo(map)
        .bindPopup('Inicio');

      const endIcon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#dc2626;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);">F</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      endMarkerRef.current = L.marker([last.lat, last.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup('Fin');

      map.fitBounds(polyline.getBounds().pad(0.1));
    }
  }, [path]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    if (currentPosition) {
      currentMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], { icon: currentIcon })
        .addTo(map)
        .bindPopup('Tu posición');

      if (path.length === 0) {
        map.setView([currentPosition.lat, currentPosition.lng], 15);
      }
    }
  }, [currentPosition, path.length]);

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden border ${className}`}
      style={{ minHeight: '250px', height: '100%' }}
    />
  );
}
