import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, token, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setAuth(data.user, data.token);
    navigate('/');
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authService.register(name, email, password);
    setAuth(data.user, data.token);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return { user, token, login, register, logout: handleLogout };
}
