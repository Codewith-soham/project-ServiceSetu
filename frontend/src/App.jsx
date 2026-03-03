import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/LoginPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === "provider" ? "/provider/dashboard" : "/dashboard"} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/dashboard" element={<UserDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["provider"]} />}>
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      </Route>
    </Routes>
  );
}
