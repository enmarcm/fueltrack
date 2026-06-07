# FuelTrack ⛽

App web **mobile-first** para llevar el control de combustible, rutas (GPS en vivo) y mantenimiento de vehículos. Calcula rendimiento (km/L), costo por km, gasto mensual y cuándo toca tanquear.

---

## 🧪 Credenciales de prueba

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
| Mapas | Google Maps JS API (`@react-google-maps/api`) |
| Backend | Node + Express + TypeScript |
| ORM / DB | Prisma + PostgreSQL (Docker) |
| Auth | JWT + bcrypt |
| PWA | vite-plugin-pwa |

---

## Requisitos previos

- **Node.js 20+** y pnpm: `npm install -g pnpm`
- **Docker Desktop** (para PostgreSQL local)
- **Cuenta de Google Cloud** con facturación activada (para Maps, opcional)

---

## Instalación rápida

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Iniciar PostgreSQL con Docker
docker compose up -d

# 3. Migrar base de datos y sembrar datos de prueba
cd server
npx prisma migrate dev --name init
pnpm seed

# 4. Iniciar backend (http://localhost:4000)
pnpm dev

# 5. En otra terminal, iniciar frontend (http://localhost:5173)
cd client
pnpm dev
```

---

## Variables de entorno

### `server/.env`
```
DATABASE_URL="postgresql://fueltrack:fueltrack@localhost:5432/fueltrack?schema=public"
JWT_ACCESS_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
JWT_REFRESH_SECRET="cambia-esto-por-otro-secreto-largo-y-aleatorio"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### `client/.env`
```
VITE_API_URL="http://localhost:4000"
VITE_GOOGLE_MAPS_API_KEY="tu-api-key-de-google-maps"
```

> Google Maps es **opcional** para visualizar mapas. La app funciona sin la key (solo no mostrará mapas).

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
- `GET /api/vehicles/:id/trips` — Listar viajes
- `POST /api/vehicles/:id/trips` — Registrar viaje
- `PUT /api/vehicles/:id/trips/:tripId` — Actualizar
- `DELETE /api/vehicles/:id/trips/:tripId` — Eliminar

### Estadísticas
- `GET /api/stats/:id` — Estadísticas del vehículo (rendimiento, costos, etc.)
- `GET /api/stats/overview` — Comparativa de todos los vehículos

---

## Estructura del proyecto

```
fueltrack/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   └── seed.ts          # Datos demo
│   └── src/
│       ├── config/           # Variables de entorno
│       ├── lib/              # Prisma, JWT, bcrypt
│       ├── middleware/       # Auth, validación, errores
│       └── features/
│           ├── auth/         # Registro, login, JWT
│           ├── vehicles/     # CRUD vehículos
│           ├── fuel/         # CRUD tanqueos
│           ├── trips/        # CRUD viajes
│           └── stats/        # Cálculos y estadísticas
├── client/
│   └── src/
│       ├── components/       # UI y layout
│       ├── pages/            # Páginas de la app
│       ├── stores/           # Zustand stores
│       ├── hooks/            # Custom hooks
│       └── lib/              # API client, utils
├── docker-compose.yml        # PostgreSQL
└── README.md
```

---

## Funcionalidades

- **Dashboard**: KPIs de rendimiento, costo/km, gasto mensual, próximo tanqueo estimado. Gráficos de gasto y rendimiento.
- **Vehículos**: CRUD completo con color personalizado, selector de vehículo activo.
- **Tanqueos**: Registro con cálculo automático de total, historial con rendimiento puntual.
- **Rutas GPS**: Grabación en vivo con watchPosition, distancia y tiempo en tiempo real.
- **Modo oscuro**: Toggle persistido, respeta preferencia del sistema.
- **PWA**: Instalable como app, caché offline de datos.
- **Mobile-first**: Navegación inferior, FAB, touch targets ≥ 44px.

---

## Cómo usar el GPS

1. Ve a **Rutas → Nueva ruta**
2. Presiona **Iniciar viaje** (el navegador pedirá permiso de ubicación)
3. Conduce con la app abierta — la distancia y tiempo se actualizan en vivo
4. Al llegar, presiona **Finalizar viaje**
5. El viaje se guarda automáticamente en el vehículo activo

> ⚠️ Mantén la pantalla encendida y la pestaña abierta. La precisión depende del GPS del dispositivo.

---

## Licencia

MIT
