import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';
import { AuthGuard } from '@/components/auth-guard';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import VehiclesPage from '@/pages/vehicles';
import VehicleDetailPage from '@/pages/vehicle-detail';
import TripsPage from '@/pages/trips';
import TripRecorderPage from '@/pages/trip-recorder';
import ProfilePage from '@/pages/profile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="fueltrack-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/vehiculos" element={<VehiclesPage />} />
                <Route path="/vehiculos/:id" element={<VehicleDetailPage />} />
                <Route path="/rutas" element={<TripsPage />} />
                <Route path="/rutas/nueva" element={<TripRecorderPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
