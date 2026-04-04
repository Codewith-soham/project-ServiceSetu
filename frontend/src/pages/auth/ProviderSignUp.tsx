import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ArrowLeft, Upload, TrendingUp, Star, Calendar } from 'lucide-react';

const ProviderSignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    serviceType: '',
    experience: '',
    pricing: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const services = [
    'Electrician', 'Plumber', 'Cleaning', 'Repair',
    'Carpenter', 'Painter', 'Pest Control', 'AC Repair'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData, 'provider');
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
        <div className="absolute inset-0 bg-black/15" />

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="space-y-8 max-w-md">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Grow Your<br />Business
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Partner with ServiceSetu to reach thousands of customers looking for your expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Partner with <span className="text-3xl font-bold tracking-tight text-white">
              Service<span className="text-[#2563EB]">Setu</span>
            </span></h1>
            <p className="text-[#9CA3AF] text-sm">Grow your business with our professional network</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name / Business Name"
                placeholder="John Doe Services"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Business Email"
                placeholder="pro@example.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Business Location"
                placeholder="City, State"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9CA3AF]">Service Type</label>
                <select
                  className="w-full h-12 rounded-[10px] border border-[#334155] bg-[#0F172A] px-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                >
                  <option value="">Select Service</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input
                label="Experience (Years)"
                placeholder="5"
                type="number"
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
              <Input
                label="Pricing (Base $/hr)"
                placeholder="50"
                type="number"
                required
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              />
            </div>

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="border-2 border-dashed border-[#334155] rounded-[15px] p-6 flex flex-col items-center justify-center space-y-2 hover:border-purple-500/50 transition-colors cursor-pointer bg-purple-500/5">
              <Upload className="text-[#4B5563]" size={28} />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Upload Profile Image</p>
                <p className="text-xs text-[#9CA3AF]">JPG, PNG or WEBP (Max 2MB)</p>
              </div>
            </div>

            <Button type="submit" size="full" className="bg-blue-600 hover:bg-purple-700 h-14" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register as Provider'}
            </Button>
          </form>

          <div className="text-center text-sm space-y-4 pt-4 border-t border-white/5">
            <p className="text-[#9CA3AF]">
              Already have an account? <Link to="/provider/login" className="text-blue-500 font-bold hover:underline">Login</Link>
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

export default ProviderSignUpPage;
