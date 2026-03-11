import api from './api';

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  me: () => api.get('/auth/me').then((r) => r.data),
};
