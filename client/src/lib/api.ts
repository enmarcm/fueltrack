import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fueltrack-auth');
  if (stored) {
    const { accessToken } = JSON.parse(stored);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const stored = localStorage.getItem('fueltrack-auth');
      if (stored && error.config && !error.config._retry) {
        error.config._retry = true;
        const { refreshToken } = JSON.parse(stored);
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/api/auth/refresh`,
            { refreshToken }
          );
          if (data.success) {
            const newAuth = { ...JSON.parse(stored), accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
            localStorage.setItem('fueltrack-auth', JSON.stringify(newAuth));
            error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(error.config);
          }
        } catch {
          localStorage.removeItem('fueltrack-auth');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
