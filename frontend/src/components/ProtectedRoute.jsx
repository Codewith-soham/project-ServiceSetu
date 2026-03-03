import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-slate-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "provider" ? "/provider/dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
