import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
