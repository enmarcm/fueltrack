# FuelTrack

App web **mobile-first** para llevar el control de combustible, rutas (GPS en vivo con OpenStreetMap) y mantenimiento de vehículos. Calcula rendimiento (km/L), costo por km, gasto mensual y cuándo toca tanquear.

---

## Credenciales de prueba

```
Email:    demo@fueltrack.app
Password: demo123
```

El seed incluye:
- **Sedán Diario** (Toyota Corolla 2022) — 10 tanqueos históricos
- **SUV Viajes** (Honda CR-V 2023) — 6 tanqueos históricos

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui |
| Estado/Datos | TanStack Query + Zustand |
| Gráficos | Recharts |
| Mapas | Leaflet + OpenStreetMap |
| Backend | Node + Express + TypeScript |
| ORM / DB | Prisma + PostgreSQL (Docker) |
| Auth | JWT + bcrypt |
| PWA | vite-plugin-pwa |

---

## Desarrollo local

### Requisitos previos
- Node.js 20+ y pnpm: `npm install -g pnpm`
- Docker

### Instalación

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Iniciar PostgreSQL con Docker
docker compose up -d

# 3. Migrar base de datos y sembrar datos de prueba
cd server
npx prisma migrate dev --name init
pnpm seed
cd ..

# 4. Iniciar server + client en paralelo (http://localhost:8081 y http://localhost:8080)
pnpm dev
```

### Variables de entorno (desarrollo local)

#### `server/.env`
```
DATABASE_URL="postgresql://fueltrack:fueltrack@localhost:5432/fueltrack?schema=public"
JWT_ACCESS_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
JWT_REFRESH_SECRET="cambia-esto-por-otro-secreto-largo-y-aleatorio"
PORT=8081
CLIENT_URL="http://localhost:8080"
```

#### `client/.env`
```
VITE_API_URL="http://localhost:8081"
```

---

## Despliegue en VPS (producción)

### Requisitos
- Docker y Docker Compose

### Pasos

```bash
# 1. Clonar
git clone https://github.com/enmarcm/fueltrack.git
cd fueltrack

# 2. Configurar variables de entorno
cp .env.production.example .env
nano .env   # Editar DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL

# 3. Iniciar todos los servicios (PostgreSQL + API + Nginx)
docker compose up -d

# 4. Sembrar datos demo (solo la primera vez)
docker compose exec server npx prisma db seed

# 5. La app corre en http://tu-vps:8080
```

La API corre internamente en el puerto **8081** y Nginx sirve el frontend en el puerto **8080** con proxy inverso a la API.

---

## Scripts

| Comando | Descripción |
|---------|------------|
| `pnpm dev` | Inicia server + client en paralelo |
| `pnpm build` | Compila ambos proyectos |
| `cd server && pnpm seed` | Sembrar datos demo |
| `cd server && pnpm prisma:studio` | Explorar DB visualmente |
| `cd server && pnpm prisma:migrate` | Crear migración |
| `cd client && pnpm build` | Build frontend producción |

---

## API endpoints

### Auth
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/refresh` — Refrescar token
- `GET /api/auth/me` — Perfil del usuario

### Vehículos (requiere auth)
- `GET /api/vehicles` — Listar vehículos
- `GET /api/vehicles/:id` — Detalle del vehículo
- `POST /api/vehicles` — Crear vehículo
- `PUT /api/vehicles/:id` — Actualizar vehículo
- `DELETE /api/vehicles/:id` — Eliminar vehículo

### Tanqueos
- `GET /api/vehicles/:id/fuel` — Listar tanqueos
- `POST /api/vehicles/:id/fuel` — Registrar tanqueo
- `PUT /api/vehicles/:id/fuel/:entryId` — Actualizar
- `DELETE /api/vehicles/:id/fuel/:entryId` — Eliminar

### Viajes
- `GET /api/trips` — Todos los viajes del usuario
- `GET /api/vehicles/:id/trips` — Viajes de un vehículo
- `POST /api/vehicles/:id/trips` — Registrar viaje
- `PUT /api/vehicles/:id/trips/:tripId` — Actualizar
- `DELETE /api/vehicles/:id/trips/:tripId` — Eliminar

### Estadísticas
- `GET /api/stats/:id` — Estadísticas del vehículo
- `GET /api/stats/overview` — Comparativa de todos los vehículos

---

## Funcionalidades

- **Dashboard**: KPIs de rendimiento, costo/km, gasto mensual, próximo tanqueo estimado. Gráficos de gasto y rendimiento.
- **Vehículos**: CRUD completo con color personalizado, selector de vehículo activo.
- **Tanqueos**: Registro con cálculo automático de total, historial con rendimiento puntual.
- **Rutas GPS**: Grabación en vivo con Leaflet + OpenStreetMap, importar/exportar GPX.
- **Modo oscuro**: Toggle persistido, respeta preferencia del sistema.
- **PWA**: Instalable como app, caché offline con service worker.
- **Mobile-first**: Navegación inferior, sidebar fijo en desktop.

---

## Licencia

MIT
