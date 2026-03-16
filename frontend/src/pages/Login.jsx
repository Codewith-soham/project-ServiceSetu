import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Assume login(user, token) signature

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        _id: "1",
        fullname: "Test User", 
        username: "testuser",
        email: email,
        role: "user", // change to "provider" to test provider dashboard
        phone: "9876543210",
        address: "Mumbai, Maharashtra"
      };
      const mockToken = "mock-access-token-123";
      
      login(mockUser, mockToken);
      
      toast.success("Logged in successfully!");
      if (mockUser.role === "provider") {
        navigate("/dashboard/provider");
      } else {
        navigate("/dashboard/user");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white">
      {/* LEFT SIDE - Testimonial & Stats (Desktop Only) */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-[#2a2a2a]"
        style={{
          background: 'linear-gradient(135deg, #111111, #0a0a0a)'
        }}
      >
        {/* Top Section */}
        <div>
          <div className="text-[24px] font-bold text-[#F97316]">ServiceSetu</div>
          <div className="text-[#525252] text-[14px] mt-2">
            Trusted home services at your doorstep
          </div>
        </div>

        {/* Middle Section - Testimonial Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[16px] p-[24px] relative z-10">
          <div className="text-[#F97316] opacity-30 text-[80px] leading-[1] mb-4 font-serif absolute -top-[10px] left-[20px] -z-10">
            "
          </div>
          <div className="text-[#a3a3a3] text-[15px] leading-[1.7] relative z-10 pt-[20px]">
            ServiceSetu made finding a reliable maid so easy. Booked in 5 minutes, she arrived on time. Highly recommend!
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[#F97316] bg-[rgba(249,115,22,0.2)] shrink-0">
              P
            </div>
            <div>
              <div className="text-white text-[14px] font-medium">Priya Sharma, Mumbai</div>
              <div className="text-[#F97316] text-[12px] tracking-[2px]">★★★★★</div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Stats */}
        <div className="flex gap-8 border-t border-[#2a2a2a] pt-8">
          <div>
            <div className="text-[20px] font-bold text-white">10K+</div>
            <div className="text-[12px] text-[#525252] mt-1">Customers</div>
          </div>
          <div>
            <div className="text-[20px] font-bold text-white">500+</div>
            <div className="text-[12px] text-[#525252] mt-1">Providers</div>
          </div>
          <div>
            <div className="text-[20px] font-bold text-white">4.8★</div>
            <div className="text-[12px] text-[#525252] mt-1">Rating</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-[40px_20px] relative">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-[#525252] hover:text-[#F97316] text-sm mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Back to home
          </Link>

          {/* Heading */}
          <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#525252] text-[14px] mb-8">
            Login to your ServiceSetu account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error Message */}
            {error && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg p-[10px_14px] text-[#ef4444] text-[13px] flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col">
              <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col relative w-full">
              <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_48px_12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all duration-200"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#F97316] transition-colors p-1 flex items-center justify-center cursor-pointer min-h-[44px]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div 
                className="text-[#F97316] text-[13px] text-right mt-2 hover:underline cursor-pointer inline-block self-end"
                onClick={() => toast.success("Password recovery flow would trigger here.")}
              >
                Forgot password?
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 bg-[#F97316] text-white p-[13px] rounded-[10px] text-[15px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:-translate-y-[1px] active:scale-[0.99] min-h-[44px] flex items-center justify-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-[#2a2a2a]"></div>
            <div className="text-[#525252] text-[13px]">or</div>
            <div className="flex-1 h-[1px] bg-[#2a2a2a]"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => toast("Google auth flow coming soon", { icon: "ℹ️" })}
            className="w-full bg-[#111111] border border-[#2a2a2a] text-white p-[12px] rounded-[10px] text-[14px] font-medium transition-all duration-200 hover:border-[#F97316] hover:bg-[#1a1a1a] flex items-center justify-center gap-3 min-h-[44px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-[#525252] text-[13px]">Don't have an account? </span>
            <Link to="/register" className="text-[#F97316] text-[13px] font-medium hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
