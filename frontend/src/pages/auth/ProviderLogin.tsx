import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const ProviderLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, 'provider');
      navigate('/provider/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex animate-fade-in">
      {/* Left Side — City Image with Text Overlay */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="/src/assets/auth-city.png"
          alt="Night City"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Right-edge blend into page background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0F172A]" />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="space-y-6 max-w-md">
            <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-2xl">
              Provider<br />Portal
            </h2>
            <p className="text-lg text-white/80 leading-relaxed drop-shadow-md">
              Manage your services and grow your business with ServiceSetu's professional platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Provider <span className="text-blue-500">Login</span></h1>
            <p className="text-[#9CA3AF] text-sm">Access your business dashboard and bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Business Email"
              placeholder="pro@servicesetu.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" size="full" className="bg-blue-600 hover:bg-blue-700 h-14" disabled={loading}>
              {loading ? 'Logging in...' : 'Continue to Dashboard'}
            </Button>
          </form>

          <div className="text-center text-sm space-y-4 pt-4 border-t border-white/5">
            <p className="text-[#9CA3AF]">
              New to ServiceSetu? <Link to="/provider/signup" className="text-blue-500 font-bold hover:underline">Register as Provider</Link>
            </p>
            <button
              onClick={() => navigate('/login-choice')}
              className="flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors mx-auto text-xs"
            >
              <ArrowLeft size={14} />
              Back to Login Choice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLoginPage;
