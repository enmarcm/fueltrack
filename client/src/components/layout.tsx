import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, Route, User, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/vehiculos', icon: Car, label: 'Vehículos' },
  { to: '/rutas', icon: Route, label: 'Rutas' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export function Layout() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed left-0 top-0 z-40 hidden md:flex w-64 h-dvh flex-col border-r bg-card p-4">
        <div className="flex items-center gap-2 px-2 py-4">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">FuelTrack</span>
        </div>
        <nav className="flex-1 space-y-1 mt-6 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground truncate">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">{user?.name || user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4 mr-2 shrink-0" /> : <Moon className="h-4 w-4 mr-2 shrink-0" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2 shrink-0" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="min-h-dvh pb-[88px] md:pb-0 md:ml-64">
        <div className="w-full px-4 py-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 text-xs font-medium min-w-[64px] py-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="fixed bottom-24 right-4 z-50 md:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}
