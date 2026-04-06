import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthLoading from './components/ui/AuthLoading';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Auth Pages
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';

// User Flow Pages
import ServicesPage from './pages/ServicesPage';
import ProviderListingPage from './pages/ProviderListingPage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';

// Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';

// Route Guards
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  console.debug('[route:UserRoute]', {
    pathname: typeof window !== 'undefined' ? window.location.pathname : null,
    isAuthenticated,
    role: user?.role ?? null,
  });
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'user') return <Navigate to="/provider/dashboard" replace />;
  return <>{children}</>;
};

const ProviderRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  console.debug('[route:ProviderRoute]', {
    pathname: typeof window !== 'undefined' ? window.location.pathname : null,
    isAuthenticated,
    role: user?.role ?? null,
  });
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'provider') return <Navigate to="/user/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { user, isAuthenticated, isAuthenticating } = useAuth();

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB] flex flex-col font-['Poppins']">
        <Navbar />
        <main className="flex-grow pt-20">
          <AuthLoading />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB] flex flex-col font-['Poppins']">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && user?.role === 'provider' ? (
                <Navigate to="/provider/dashboard" replace />
              ) : isAuthenticated && user?.role === 'user' ? (
                <Navigate to="/user/dashboard" replace />
              ) : (
                <HomePage />
              )
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Legacy Redirects */}
          <Route path="/login-choice" element={<Navigate to="/login" replace />} />
          <Route path="/signup-choice" element={<Navigate to="/signup" replace />} />
          <Route path="/user/login" element={<Navigate to="/login" replace />} />
          <Route path="/user/signup" element={<Navigate to="/signup" replace />} />
          <Route path="/provider/login" element={<Navigate to="/login" replace />} />
          <Route path="/provider/signup" element={<Navigate to="/signup" replace />} />
          
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/providers" element={<ProviderListingPage />} />
          <Route path="/provider/:id" element={<ProviderDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Dashboards */}
          <Route 
            path="/user/dashboard" 
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            } 
          />
          <Route 
            path="/provider/dashboard" 
            element={
              <ProviderRoute>
                <ProviderDashboard />
              </ProviderRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
