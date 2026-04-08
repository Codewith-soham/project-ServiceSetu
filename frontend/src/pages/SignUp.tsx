import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { providerApi } from '../services/apiClient.js';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, User, Briefcase, BadgeIndianRupee, Clock, ShieldCheck, Mail, Phone, MapPin, Lock } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, updateProfile } = useAuth();
  
  const [isProvider, setIsProvider] = useState(location.state?.role === 'provider');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    // Provider specific fields
    serviceType: '',
    pricing: '',
    isAvailable: true
  });
  const [providerImage, setProviderImage] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = [
    { label: 'Electrician', value: 'electrician' },
    { label: 'Plumber', value: 'plumber' },
    { label: 'Maid', value: 'maid' },
    { label: 'Care Taker', value: 'care-taker' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const traceId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `signup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.info(`[signup:${traceId}] start`, {
      isProvider,
      fullname: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      serviceType: formData.serviceType,
      hasProviderImage: !!providerImage,
    });
    
    try {
      // STEP A: Register (returns response with accessToken)
      // role is always "user" at register — becomeProvider upgrades it
      const loginRes = await signup(formData, { traceId });
      const accessToken = loginRes?.data?.accessToken;
      console.info(`[signup:${traceId}] register success`, {
        userRole: loginRes?.data?.user?.role ?? null,
        hasAccessToken: !!accessToken,
      });

      // STEP B: If isProvider toggle is ON, call becomeProvider
      if (isProvider) {
        if (!providerImage) {
          console.warn(`[signup:${traceId}] missing provider image`);
          throw new Error('Provider image is required');
        }

        const providerFormData = new FormData();
        providerFormData.append('serviceType', formData.serviceType);
        providerFormData.append('address', formData.address);
        providerFormData.append('pricing', String(formData.pricing));
        providerFormData.append('isAvailable', String(formData.isAvailable));
        providerFormData.append('image', providerImage);

        console.info(`[signup:${traceId}] becomeProvider start`, {
          serviceType: formData.serviceType,
          pricing: formData.pricing,
          isAvailable: formData.isAvailable,
        });

        try {
          const providerRes = await providerApi.becomeProvider(providerFormData, accessToken, {
            traceId,
          });
          console.info(`[signup:${traceId}] becomeProvider success`, {
            providerId: providerRes?.data?._id ?? providerRes?.data?.id ?? null,
            responseMessage: providerRes?.message ?? null,
          });

          updateProfile({ role: 'provider' });
          updateProfile({
            role: 'provider',
            serviceType: formData.serviceType,
            pricing: String(formData.pricing || ''),
          });
          console.info(`[signup:${traceId}] updateProfile dispatched`, { nextRole: 'provider' });
          
          // STEP C: Navigate to provider dashboard
          console.info(`[signup:${traceId}] navigate`, { to: '/provider/dashboard' });
          navigate('/provider/dashboard', { replace: true });
        } catch (err: any) {
          // ❌ STEP B PROVIDER SETUP FAILED - DO NOT REDIRECT TO USER DASHBOARD
          console.error(`[signup:${traceId}] becomeProvider failed`, {
            message: err?.message,
            stack: err?.stack,
          });
          setLoading(false);
          
          // Show detailed error to user - STAY ON THIS PAGE, do not redirect
          setError(`❌ Provider registration failed!\n\nError: ${err.message}\n\nPlease check:\n• Service type is selected\n• Address is valid and can be geocoded\n• All required fields are filled\n\nTry again or contact support.`);
          return;
        }
      } else {
        // STEP C: Navigate to user dashboard
        console.info(`[signup:${traceId}] navigate`, { to: '/user/dashboard' });
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error(`[signup:${traceId}] signup failed`, {
        message: err?.message,
        stack: err?.stack,
      });
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex animate-fade-in bg-[#0F172A]">
      {/* Left Side — Artistic Hero Area */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-[#0F172A] z-0" />
        <img
          src="/src/assets/auth-city.png"
          alt="ServiceSetu"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        
        <div className="relative z-10 flex flex-col justify-center px-20 py-20">
          <div className="space-y-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <ShieldCheck size={16} />
              Trusted Local Professionals
            </div>
            
            <h2 className="text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              One Step<br />
              Away from<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Better Living
              </span>
            </h2>
            
            <p className="text-xl text-white/60 leading-relaxed max-w-md">
              Join thousands of users and service providers on the most reliable platform for local home services.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">50k+</div>
                <div className="text-sm text-white/40">Happy Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">200+</div>
                <div className="text-sm text-white/40">Verified Experts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Unified Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 py-10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <h1 className="text-4xl font-bold text-white tracking-tight">Create <span className="text-blue-500">Account</span></h1>
               <div className="text-xs text-white/30 hidden sm:block">Step 1 of 1</div>
            </div>
            <p className="text-[#9CA3AF] text-base leading-relaxed">Join the ServiceSetu community today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake font-mono whitespace-pre-wrap break-words">
                {error}
              </div>
            )}

            {/* Basic Info Section */}
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={<User size={18} className="text-white/40" />}
                required
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  type="email"
                  icon={<Mail size={18} className="text-white/40" />}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  icon={<Phone size={18} className="text-white/40" />}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <Input
                label="Full Address"
                placeholder="123 Harmony St, New York"
                icon={<MapPin size={18} className="text-white/40" />}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={18} className="text-white/40" />}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Provider Toggle - Glass Morphism Style */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              isProvider 
              ? 'bg-blue-500/5 border-blue-500/30' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}>
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${
                    isProvider ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'
                  }`}>
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">I am a service provider</h3>
                    <p className="text-sm text-white/40">Toggle to offer your services on the platform</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isProvider}
                    onChange={(e) => setIsProvider(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </div>
              </label>

              {/* Step 2 Extra Fields (Animated expansion) */}
              {isProvider && (
                <div className="mt-8 space-y-6 animate-slide-down">
                  <div className="h-px bg-white/10 w-full mb-6" />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Provider Image</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required={isProvider}
                      className="w-full h-12 rounded-xl border border-white/10 bg-[#0F172A] px-4 py-2 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                      onChange={(e) => setProviderImage(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-white/30">Upload a JPG, PNG, or WEBP image up to 5MB.</p>
                    {providerImage && (
                      <p className="text-xs text-blue-400 break-all">Selected: {providerImage.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Service Type</label>
                    <div className="relative">
                      <select
                        className="w-full h-12 rounded-xl border border-white/10 bg-[#0F172A] px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                        required={isProvider}
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      >
                        <option value="">Select your specialty</option>
                        {services.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Pricing per hour (₹)"
                      placeholder="500"
                      type="number"
                      icon={<BadgeIndianRupee size={18} className="text-white/40" />}
                      required={isProvider}
                      value={formData.pricing}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    />
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-white/70">Initial Availability</label>
                      <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-white/5 border border-white/5">
                        <Clock size={18} className={formData.isAvailable ? 'text-green-400' : 'text-white/20'} />
                        <span className="text-sm text-white/60 flex-grow">{formData.isAvailable ? 'Available Now' : 'Busy'}</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-md border-white/10 bg-[#0F172A] text-blue-600 focus:ring-blue-500" 
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button 
                type="submit" 
                size="full" 
                className={`h-14 font-bold text-lg shadow-xl shadow-blue-600/20 transform transition-all active:scale-[0.98] ${
                    isProvider ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                }`} 
                disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                isProvider ? 'Join as Professional' : 'Create My Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm space-y-6 pt-6 border-t border-white/5">
            <p className="text-[#9CA3AF]">
              Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Sign In</Link>
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mx-auto text-xs"
            >
              <ArrowLeft size={14} />
              Return to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
