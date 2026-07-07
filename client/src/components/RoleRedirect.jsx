import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function RoleRedirect() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  // Admins should land on the analytics dashboard; others keep their dashboard
  if (user.role === 'admin') {
    return <Navigate replace to="/admin/analytics" />;
  }

  return <Navigate replace to={`/${user.role}/dashboard`} />;
}

export default RoleRedirect;
