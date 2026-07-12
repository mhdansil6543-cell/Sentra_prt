import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import { hasPermission } from "./permissions";

function ProtectedRoute({ children, permission }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;