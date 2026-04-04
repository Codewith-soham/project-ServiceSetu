import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Shield, Zap, Users } from 'lucide-react';

const UserSignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData, 'user');
      navigate('/user/dashboard');
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
          <div className="space-y-8 max-w-md">
            <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-2xl">
              Join<br />ServiceSetu
            </h2>
            <p className="text-lg text-white/80 leading-relaxed drop-shadow-md">
              Create your account to connect with trusted local professionals for all your service needs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Create <span className="text-[#2563EB]">Account</span></h1>
            <p className="text-[#9CA3AF] text-sm">Join ServiceSetu to start booking local experts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <Input
              label="Your Location"
              placeholder="City, State"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <p className="text-[10px] text-[#4B5563] text-center">
              By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>

            <Button type="submit" size="full" className="h-14" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm space-y-4 pt-4 border-t border-white/5">
            <p className="text-[#9CA3AF]">
              Already have an account? <Link to="/user/login" className="text-[#2563EB] font-bold hover:underline">Login</Link>
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors mx-auto text-xs"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignUpPage;
