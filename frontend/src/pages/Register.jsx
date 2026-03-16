import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Eye, EyeOff, Loader2, AlertCircle, 
  CheckCircle, XCircle, ShoppingBag, Briefcase, Check, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1 states
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Provider states
  const [serviceType, setServiceType] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Needed if auto-login after register is ever added

  // Password strength logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#ef4444' };
    
    const hasNumOrSym = /[0-9!@#$%^&*]/.test(pass);
    if (pass.length >= 8 && hasNumOrSym) {
      return { score: 3, label: 'Strong', color: '#22c55e' };
    }
    
    return { score: 2, label: 'Medium', color: '#eab308' };
  };

  const strength = getPasswordStrength(password);
  const showMatchIndicator = confirmPassword.length > 0;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  // Render Pill Helpr
  const renderPill = (stepNumber, label) => {
    if (currentStep === stepNumber) {
      // Active
      return (
        <div className="bg-[#F97316] text-white px-[16px] py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300">
          Step {stepNumber}: {label}
        </div>
      );
    } else if (currentStep > stepNumber) {
      // Completed
      return (
        <div className="bg-[rgba(249,115,22,0.2)] text-[#F97316] border border-[rgba(249,115,22,0.3)] px-[16px] py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300">
          Step {stepNumber}: {label}
        </div>
      );
    } else {
      // Inactive
      return (
        <div className="bg-[#1a1a1a] text-[#525252] border border-[#2a2a2a] px-[16px] py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300">
          Step {stepNumber}: {label}
        </div>
      );
    }
  };

  const validateStep1 = () => {
    setError('');
    
    if (!fullname || !username || !phone || !address) {
      setError("Please fill in all personal details.");
      return false;
    }

    if (fullname.length < 2) {
      setError("Full name must be at least 2 characters.");
      return false;
    }
    
    if (!/^[a-z0-9]+$/.test(username)) {
      setError("Username can only have lowercase letters and numbers.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return false;
    }

    if (address.length < 5) {
      setError("Please provide a more detailed address.");
      return false;
    }
    
    return true;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate Step 2
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all account details");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === 'provider') {
      if (!serviceType) {
        setError("Please select your service type.");
        return;
      }
      if (!serviceArea || serviceArea.length < 3) {
        setError("Please enter your service area.");
        return;
      }
    }
    
    if (!agreedToTerms) {
      setError("Please agree to the terms to continue.");
      return;
    }

    setIsLoading(true);

    try {
      // Mock network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden flex">
      {/* LEFT PANEL */}
      <div 
        className="hidden lg:flex w-1/2 flex-col justify-between p-[48px] border-r border-[#2a2a2a] min-h-screen fixed left-0 top-0 bottom-0"
        style={{
          background: 'linear-gradient(135deg, #111111, #0a0a0a)'
        }}
      >
        <div>
          <div className="text-[24px] font-bold text-[#F97316]">ServiceSetu</div>
          <div className="text-[#525252] text-[14px] mt-2">
            Trusted home services at your doorstep
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[16px] p-[24px] relative w-full xl:max-w-[500px]">
          <div className="text-[#F97316] opacity-30 text-[80px] leading-[1] mb-2 font-serif absolute -top-[10px] left-[20px] -z-10">
            "
          </div>
          <div className="text-[#a3a3a3] text-[15px] leading-[1.7] relative z-10 pt-4">
            ServiceSetu made finding a reliable maid so easy. Booked in 5 minutes, she arrived on time. Highly recommend!
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(249,115,22,0.2)] text-[#F97316] font-semibold text-[16px] flex items-center justify-center shrink-0">
              P
            </div>
            <div>
              <div className="text-white text-[14px] font-medium">Priya Sharma, Mumbai</div>
              <div className="text-[#F97316] text-[12px] mt-0.5 tracking-[1px]">★★★★★</div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
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

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center min-h-screen p-[40px_20px]">
        <div className="w-full max-w-[480px] mx-auto">
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-[#525252] hover:text-[#F97316] text-[14px] mb-[32px] transition-colors"
          >
            <ChevronLeft size={16} /> Back to home
          </Link>

          <h1 className="text-[28px] font-bold text-white mb-[8px] tracking-tight">
            Create your account
          </h1>
          <p className="text-[#525252] text-[14px] mb-[32px]">
            Join thousands of happy customers
          </p>

          <div className="flex items-center gap-[8px] mb-[32px] overflow-hidden">
            {renderPill(1, "Personal Info")}
            <div className={`flex-1 h-[1px] transition-all duration-300 ${currentStep > 1 ? 'bg-[#F97316] opacity-30' : 'bg-[#2a2a2a]'}`} />
            {renderPill(2, "Account Setup")}
            
            {role === 'provider' ? (
              <>
                <div className={`flex-1 h-[1px] transition-all duration-300 bg-[#2a2a2a]`} />
                <div className="bg-[#1a1a1a] text-[#525252] border border-[#2a2a2a] px-[16px] py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-300">
                  Step 3: Provider Info
                </div>
              </>
            ) : (
                <>
                <div className={`flex-1 h-[1px] transition-all duration-300 bg-[#2a2a2a] opacity-50`} />
                <div className="bg-[#111111] text-[#2a2a2a] border border-[#1a1a1a] px-[16px] py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap duration-300 cursor-not-allowed hidden sm:block">
                  Done!
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-[8px] p-[10px_14px] mt-4 mb-4 text-[#ef4444] text-[13px] flex items-center gap-2 transition-all">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ====== STEP 1 FORM ====== */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex flex-col">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Full name</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Rahul Sharma"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Username</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="rahulsharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                />
                <div className="text-[#525252] text-[12px] mt-1">Only lowercase letters and numbers</div>
              </div>

              <div className="flex flex-col">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Phone number</label>
                <div className="flex w-full">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-r-0 rounded-l-[10px] p-[12px_14px] text-[#a3a3a3] text-[15px] flex-shrink-0 flex items-center justify-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-[#111111] border border-[#2a2a2a] border-l-0 rounded-r-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Your city & area</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Andheri West, Mumbai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F97316] text-white p-[13px] rounded-[10px] text-[15px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:-translate-y-[1px] active:scale-[0.99] min-h-[44px]"
              >
                Continue →
              </button>
            </form>
          )}

          {/* ====== STEP 2 FORM ====== */}
          {currentStep === 2 && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4 animate-in fade-in zoom-in-95 slide-in-from-right-4 duration-300">
              
              <div className="flex flex-col">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                />
              </div>

              <div className="flex flex-col relative w-full mb-1">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Create password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_48px_12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
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
                {password.length > 0 && (
                  <div className="flex flex-col mt-2 mb-1">
                    <div className="flex gap-1">
                      <div className={`flex-1 h-[3px] rounded-[2px] transition-all duration-300 ${strength.score >= 1 ? 'bg-[#ef4444]' : 'bg-[#2a2a2a]'}`} style={strength.score >= 1 ? {backgroundColor: strength.color} : {}}></div>
                      <div className={`flex-1 h-[3px] rounded-[2px] transition-all duration-300 ${strength.score >= 2 ? 'bg-[#eab308]' : 'bg-[#2a2a2a]'}`} style={strength.score >= 2 ? {backgroundColor: strength.color} : {}}></div>
                      <div className={`flex-1 h-[3px] rounded-[2px] transition-all duration-300 ${strength.score >= 3 ? 'bg-[#22c55e]' : 'bg-[#2a2a2a]'}`} style={strength.score >= 3 ? {backgroundColor: strength.color} : {}}></div>
                    </div>
                    <div className="text-[12px] font-medium mt-1 transition-colors duration-300" style={{color: strength.color || '#525252'}}>
                      {strength.label}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col relative w-full mb-1">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_80px_12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                  />
                  <div className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {showMatchIndicator && (
                      <div className="mr-1 flex items-center justify-center animate-in fade-in zoom-in-0">
                        {doPasswordsMatch ? (
                          <CheckCircle size={16} className="text-[#22c55e]" />
                        ) : (
                          <XCircle size={16} className="text-[#ef4444]" />
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      tabIndex="-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#525252] hover:text-[#F97316] transition-colors p-1 flex items-center justify-center cursor-pointer min-h-[44px]"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col mt-2">
                <label className="text-[#a3a3a3] text-[13px] font-medium mb-3">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* User Role Card */}
                  <div 
                    onClick={() => setRole('user')}
                    className={`relative rounded-[12px] p-[16px_12px] text-center cursor-pointer transition-all duration-200 border ${role === 'user' ? 'border-[#F97316] bg-[rgba(249,115,22,0.08)]' : 'border-[#2a2a2a] bg-[#111111]'}`}
                  >
                    {role === 'user' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#F97316] rounded-full flex items-center justify-center animate-in zoom-in-50">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <ShoppingBag size={24} className={`mx-auto mb-2 ${role === 'user' ? 'text-[#F97316]' : 'text-[#525252]'}`} />
                    <div className={`text-[14px] font-semibold ${role === 'user' ? 'text-white' : 'text-[#a3a3a3]'}`}>Book Services</div>
                    <div className="text-[11px] text-[#525252] mt-1 leading-snug">Find and hire home services</div>
                  </div>

                  {/* Provider Role Card */}
                  <div 
                    onClick={() => setRole('provider')}
                    className={`relative rounded-[12px] p-[16px_12px] text-center cursor-pointer transition-all duration-200 border ${role === 'provider' ? 'border-[#F97316] bg-[rgba(249,115,22,0.08)]' : 'border-[#2a2a2a] bg-[#111111]'}`}
                  >
                    {role === 'provider' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#F97316] rounded-full flex items-center justify-center animate-in zoom-in-50">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <Briefcase size={24} className={`mx-auto mb-2 ${role === 'provider' ? 'text-[#F97316]' : 'text-[#525252]'}`} />
                    <div className={`text-[14px] font-semibold ${role === 'provider' ? 'text-white' : 'text-[#a3a3a3]'}`}>Offer Services</div>
                    <div className="text-[11px] text-[#525252] mt-1 leading-snug">Earn by offering your skills</div>
                  </div>
                </div>
              </div>

              {/* ====== PROVIDER EXTRA FIELDS ====== */}
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: role === 'provider' ? '500px' : '0',
                  opacity: role === 'provider' ? 1 : 0,
                  marginTop: role === 'provider' ? '8px' : '0'
                }}
              >
                <div className="border-t border-[#2a2a2a] my-4 w-full" />
                <div className="text-[#F97316] text-[12px] font-semibold uppercase tracking-[1.5px] mb-4">
                  Provider Details
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">What service do you offer?</label>
                  <select
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_40px_12px_16px] text-white text-[15px] focus:border-[#F97316] focus:outline-none cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center'
                    }}
                    value={serviceType}
                    required={role === 'provider'}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="" className="text-[#525252]">Select your service type</option>
                    <option value="maid" className="text-white">🧹 Maid</option>
                    <option value="electrician" className="text-white">⚡ Electrician</option>
                    <option value="plumber" className="text-white">🔧 Plumber</option>
                    <option value="caretaker" className="text-white">👴 Caretaker</option>
                  </select>
                </div>

                <div className="flex flex-col mb-4">
                  <label className="text-[#a3a3a3] text-[13px] font-medium mb-2">Which city/area do you work in?</label>
                  <input
                    type="text"
                    required={role === 'provider'}
                    placeholder="e.g. Andheri, Mumbai or Koramangala, Bangalore"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-[12px_16px] text-white text-[15px] placeholder:text-[#525252] focus:border-[#F97316] focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)] transition-all"
                  />
                  <div className="flex items-center gap-1 text-[#525252] text-[12px] mt-1">
                    <Info size={12} /> You can expand your service area later
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[rgba(249,115,22,0.05)] border border-[rgba(249,115,22,0.15)] rounded-[10px] p-[12px_14px]">
                  <Info size={16} className="text-[#F97316] shrink-0 mt-0.5" />
                  <div className="text-[#a3a3a3] text-[13px] leading-[1.6]">
                    Your profile will be reviewed by our team before going live. This usually takes 24 hours.
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mt-5">
                <div
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-[18px] h-[18px] flex shrink-0 mt-0.5 rounded-[4px] border items-center justify-center cursor-pointer transition-colors ${agreedToTerms ? 'bg-[#F97316] border-[#F97316]' : 'bg-[#111111] border-[#2a2a2a]'}`}
                >
                  {agreedToTerms && <Check size={10} className="text-white" />}
                </div>
                <div className="text-[#525252] text-[13px] leading-[1.5]">
                  I agree to the <span className="text-[#F97316] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#F97316] hover:underline cursor-pointer">Privacy Policy</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-[#111111] border border-[#2a2a2a] text-[#a3a3a3] hover:border-[#F97316] hover:text-white rounded-[10px] py-[13px] px-[20px] text-[14px] transition-all duration-200 min-h-[44px] shrink-0"
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !agreedToTerms}
                  className={`flex-1 bg-[#F97316] text-white p-[13px] rounded-[10px] text-[15px] font-semibold transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 ${(!agreedToTerms || isLoading) ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : 'hover:bg-[#ea6c0a] hover:shadow-[0_8px_25px_rgba(249,115,22,0.35)] hover:-translate-y-[1px] active:scale-[0.99]'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Creating account...
                    </>
                  ) : (
                     "Create Account"
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-6">
                <span className="text-[#525252] text-[13px]">Already have an account? </span>
                <Link to="/login" className="text-[#F97316] text-[13px] font-medium hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
