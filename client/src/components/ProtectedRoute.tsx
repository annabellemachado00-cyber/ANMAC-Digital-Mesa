import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  isAllowed?: boolean;
  redirectTo?: string;
  roles?: UserRole[];
}

const ProtectedRoute = ({ isAllowed, redirectTo = '/login', roles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const allowedByRole = roles ? (user ? roles.includes(user.role) : false) : true;
  if (!isAllowed || !allowedByRole) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
