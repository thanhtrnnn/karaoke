import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { hasRouteAccess, getUserFromStorage, ROLE_DEFAULT_ROUTE } from '../config/rbac';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getUserFromStorage();
  if (!user) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (!hasRouteAccess(user.role, location.pathname)) {
    const fallback = ROLE_DEFAULT_ROUTE[user.role] || '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
