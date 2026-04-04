import { Routes, Route } from 'react-router';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginChoicePage from './pages/LoginChoicePage';
import SignUpChoicePage from './pages/SignUpChoicePage';

// Auth Pages
import UserLoginPage from './pages/auth/UserLogin';
import UserSignUpPage from './pages/auth/UserSignUp';
import ProviderLoginPage from './pages/auth/ProviderLogin';
import ProviderSignUpPage from './pages/auth/ProviderSignUp';

// User Flow Pages
import ServicesPage from './pages/ServicesPage';
import ProviderListingPage from './pages/ProviderListingPage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';

// Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';

function App() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB] flex flex-col font-['Poppins']">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login-choice" element={<LoginChoicePage />} />
          <Route path="/signup-choice" element={<SignUpChoicePage />} />
          
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/providers" element={<ProviderListingPage />} />
          <Route path="/provider/:id" element={<ProviderDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* User Routes */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/signup" element={<UserSignUpPage />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />

          {/* Provider Routes */}
          <Route path="/provider/login" element={<ProviderLoginPage />} />
          <Route path="/provider/signup" element={<ProviderSignUpPage />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
