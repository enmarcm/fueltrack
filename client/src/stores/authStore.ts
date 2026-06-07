import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('fueltrack-auth', JSON.stringify({ user, accessToken, refreshToken }));
    set({ user, accessToken, refreshToken });
  },
  logout: () => {
    localStorage.removeItem('fueltrack-auth');
    set({ user: null, accessToken: null, refreshToken: null });
  },
  isAuthenticated: () => {
    const { accessToken } = get();
    return !!accessToken;
  },
}));

const stored = localStorage.getItem('fueltrack-auth');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    useAuthStore.getState().setAuth(parsed.user, parsed.accessToken, parsed.refreshToken);
  } catch { /* ignore */ }
}
