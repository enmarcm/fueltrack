import { useNavigate } from 'react-router-dom';
import { User, Car, Sun, Moon, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{user?.name || 'Usuario'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <CardContent className="p-4 flex items-center gap-3">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>FuelTrack v1.0.0</p>
      </div>
    </div>
  );
}
