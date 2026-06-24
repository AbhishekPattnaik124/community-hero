import api from './axios.instance';
import { useAuthStore } from '@store/authStore';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  googleLoginUrl: () => '/api/auth/google',
};

/**
 * Handle Google OAuth callback tokens from URL params
 */
export function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const refresh = params.get('refresh');
  return { token, refresh };
}
