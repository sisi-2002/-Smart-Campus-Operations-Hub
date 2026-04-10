import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

<<<<<<< Updated upstream
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
=======
  // Logged in but wrong role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
>>>>>>> Stashed changes
  }

  return children;
}