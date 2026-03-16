import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Zap, Wrench, Heart, ShieldCheck, 
  Star, BadgeCheck, Search, Users, 
  CheckCircle, Menu, X 
} from 'lucide-react';

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(var(--rotation)); }
            50% { transform: translateY(-10px) rotate(var(--rotation)); }
          }
        `}
      </style>

      {/* SECTION 1 - NAVBAR */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12"
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #2a2a2a',
          height: '64px',
        }}
      >
        <div 
          className="text-[#F97316] font-bold text-[22px] tracking-[-0.5px]"
        >
          ServiceSetu
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center">
          <button 
            onClick={() => navigate('/login')}
            className="border border-[#2a2a2a] text-[#a3a3a3] rounded-lg text-[14px] transition-all duration-200 hover:border-[#F97316] hover:text-white mr-3 py-2 px-5 min-h-[44px]"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#F97316] text-white rounded-lg text-[14px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] py-2 px-5 min-h-[44px]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <button 
          className="md:hidden text-white min-h-[44px] flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Fullscreen Overlay Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#0a0a0a] md:hidden"
        >
          <button 
            className="absolute top-4 right-6 text-white min-h-[44px] flex items-center justify-center p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <button 
            onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
            className="w-full max-w-xs border border-[#2a2a2a] text-[#a3a3a3] rounded-lg text-[14px] transition-all duration-200 hover:border-[#F97316] hover:text-white py-2 px-5 min-h-[44px]"
          >
            Login
          </button>
          <button 
            onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
            className="w-full max-w-xs bg-[#F97316] text-white rounded-lg text-[14px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] py-2 px-5 min-h-[44px]"
          >
            Get Started
          </button>
        </div>
      )}

      {/* SECTION 2 - HERO */}
      <section className="pt-[120px] px-5 pb-[80px] md:pt-[160px] md:px-[80px] md:pb-[100px] flex flex-col items-center text-center md:grid md:grid-cols-2 md:gap-16 md:items-center max-w-[1200px] mx-auto md:text-left">
        {/* Left Content */}
        <div className="flex flex-col items-center md:items-start w-full">
          {/* Announcement Pill */}
          <div 
            className="inline-flex items-center gap-2 mb-6 font-medium text-[13px] rounded-full px-[14px] py-[6px] text-[#F97316]"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
            }}
          >
            🏠 Trusted by 10,000+ families across India
          </div>

          <h1 className="text-[36px] md:text-[48px] font-extrabold text-white mb-5 leading-[1.1] tracking-[-1.5px]">
            Quality Home Services,<br/>
            <span 
              style={{
                background: 'linear-gradient(135deg, #F97316, #ff6b35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              At Your Doorstep
            </span>
          </h1>

          <p className="text-[#a3a3a3] text-[15px] md:text-[17px] mb-10 max-w-[480px] leading-[1.7]">
            Book verified maids, electricians, plumbers and caretakers in your city. Fast, reliable, affordable.
          </p>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/home')}
              className="bg-[#F97316] text-white rounded-xl text-[16px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)] hover:-translate-y-[1px] w-full md:w-auto py-4 md:py-[14px] px-[28px] min-h-[44px]"
            >
              Book a Service →
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-transparent border border-[#2a2a2a] text-[#a3a3a3] rounded-xl text-[16px] transition-all duration-200 hover:border-[#F97316] hover:text-white w-full md:w-auto py-4 md:py-[14px] px-[28px] min-h-[44px]"
            >
              Become a Provider
            </button>
          </div>

          {/* Stats Row (Desktop Only) */}
          <div className="hidden md:flex gap-8 mt-12 pt-12 border-t border-[#2a2a2a] w-full">
            <div>
              <div className="text-[28px] font-bold text-white">10K+</div>
              <div className="text-[13px] text-[#525252] mt-1">Happy Customers</div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-white">500+</div>
              <div className="text-[13px] text-[#525252] mt-1">Verified Providers</div>
            </div>
            <div>
              <div className="text-[28px] font-bold text-white">4.8★</div>
              <div className="text-[13px] text-[#525252] mt-1">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Right Content (Desktop Only) */}
        <div className="hidden md:block relative h-[500px] w-full">
          {/* Glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)'
            }}
          />

          {/* Card 1 - Maid */}
          <div 
            className="absolute flex items-center gap-3 rounded-[16px] bg-[#1a1a1a] border border-[#2a2a2a] p-[16px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-w-[180px]"
            style={{
              top: '40px', left: '20px',
              '--rotation': '-3deg',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center rounded-[10px] w-[40px] h-[40px] bg-[rgba(249,115,22,0.15)] shrink-0">
              <Home className="text-[#F97316]" size={20} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Maid Service</div>
              <div className="text-[12px] text-[#F97316]">From ₹299/day</div>
            </div>
          </div>

          {/* Card 2 - Electrician */}
          <div 
            className="absolute flex items-center gap-3 rounded-[16px] bg-[#1a1a1a] border border-[#2a2a2a] p-[16px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-w-[180px]"
            style={{
              top: '80px', right: '0px',
              '--rotation': '3deg',
              animation: 'float 4s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center rounded-[10px] w-[40px] h-[40px] bg-[rgba(59,130,246,0.15)] shrink-0">
              <Zap className="text-[#3b82f6]" size={20} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Electrician</div>
              <div className="text-[12px] text-[#3b82f6]">From ₹199/visit</div>
            </div>
          </div>

          {/* Card 3 - Plumber */}
          <div 
            className="absolute flex items-center gap-3 rounded-[16px] bg-[#1a1a1a] border border-[#2a2a2a] p-[16px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-w-[180px]"
            style={{
              bottom: '120px', left: '0px',
              '--rotation': '2deg',
              animation: 'float 3.5s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center rounded-[10px] w-[40px] h-[40px] bg-[rgba(34,197,94,0.15)] shrink-0">
              <Wrench className="text-[#22c55e]" size={20} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Plumber</div>
              <div className="text-[12px] text-[#22c55e]">From ₹249/visit</div>
            </div>
          </div>

          {/* Card 4 - Caretaker */}
          <div 
            className="absolute flex items-center gap-3 rounded-[16px] bg-[#1a1a1a] border border-[#2a2a2a] p-[16px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-w-[180px]"
            style={{
              bottom: '60px', right: '20px',
              '--rotation': '-2deg',
              animation: 'float 4.5s ease-in-out infinite'
            }}
          >
            <div className="flex items-center justify-center rounded-[10px] w-[40px] h-[40px] bg-[rgba(168,85,247,0.15)] shrink-0">
              <Heart className="text-[#a855f7]" size={20} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Caretaker</div>
              <div className="text-[12px] text-[#a855f7]">From ₹499/day</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - SERVICE CATEGORIES */}
      <section className="bg-[#0a0a0a] py-[80px] px-[20px] md:py-[100px] md:px-[24px] max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-3 uppercase tracking-[2px] font-semibold text-[#F97316] text-[13px]">
          OUR SERVICES
        </div>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white text-center mb-3 tracking-[-1px]">
          What do you need help with?
        </h2>
        <p className="text-[#525252] text-[16px] text-center mb-[40px] md:mb-[60px]">
          Choose from our trusted services
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 - Maid */}
          <div 
            onClick={() => navigate('/home?service=maid')}
            className="cursor-pointer text-center rounded-[20px] bg-[#111111] border border-[#2a2a2a] p-[20px_16px] md:p-[28px_20px] transition-all duration-300 active:scale-[0.98] hover:bg-[#1a1a1a] hover:border-[#F97316] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] min-h-[44px]"
          >
            <div className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-[16px] mx-auto mb-4 flex items-center justify-center bg-[rgba(249,115,22,0.1)] text-[#F97316]">
              <Home className="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
            </div>
            <h3 className="text-[15px] md:text-[18px] font-bold text-white mb-1">Maid</h3>
            <p className="text-[#525252] text-[12px] leading-relaxed mb-3">House cleaning, cooking, childcare</p>
            <div className="text-[#F97316] font-bold text-[14px]">From ₹299/day</div>
          </div>

          {/* Card 2 - Electrician */}
          <div 
            onClick={() => navigate('/home?service=electrician')}
            className="cursor-pointer text-center rounded-[20px] bg-[#111111] border border-[#2a2a2a] p-[20px_16px] md:p-[28px_20px] transition-all duration-300 active:scale-[0.98] hover:bg-[#1a1a1a] hover:border-[#F97316] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] min-h-[44px]"
          >
            <div className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-[16px] mx-auto mb-4 flex items-center justify-center bg-[rgba(59,130,246,0.1)] text-[#3b82f6]">
              <Zap className="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
            </div>
            <h3 className="text-[15px] md:text-[18px] font-bold text-white mb-1">Electrician</h3>
            <p className="text-[#525252] text-[12px] leading-relaxed mb-3">Wiring, repairs, installation</p>
            <div className="text-[#3b82f6] font-bold text-[14px]">From ₹199/visit</div>
          </div>

          {/* Card 3 - Plumber */}
          <div 
            onClick={() => navigate('/home?service=plumber')}
            className="cursor-pointer text-center rounded-[20px] bg-[#111111] border border-[#2a2a2a] p-[20px_16px] md:p-[28px_20px] transition-all duration-300 active:scale-[0.98] hover:bg-[#1a1a1a] hover:border-[#F97316] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] min-h-[44px]"
          >
            <div className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-[16px] mx-auto mb-4 flex items-center justify-center bg-[rgba(34,197,94,0.1)] text-[#22c55e]">
              <Wrench className="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
            </div>
            <h3 className="text-[15px] md:text-[18px] font-bold text-white mb-1">Plumber</h3>
            <p className="text-[#525252] text-[12px] leading-relaxed mb-3">Leaks, pipe fitting, drainage</p>
            <div className="text-[#22c55e] font-bold text-[14px]">From ₹249/visit</div>
          </div>

          {/* Card 4 - Caretaker */}
          <div 
            onClick={() => navigate('/home?service=caretaker')}
            className="cursor-pointer text-center rounded-[20px] bg-[#111111] border border-[#2a2a2a] p-[20px_16px] md:p-[28px_20px] transition-all duration-300 active:scale-[0.98] hover:bg-[#1a1a1a] hover:border-[#F97316] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] min-h-[44px]"
          >
            <div className="w-[52px] h-[52px] md:w-[64px] md:h-[64px] rounded-[16px] mx-auto mb-4 flex items-center justify-center bg-[rgba(168,85,247,0.1)] text-[#a855f7]">
              <Heart className="w-[22px] h-[22px] md:w-[28px] md:h-[28px]" />
            </div>
            <h3 className="text-[15px] md:text-[18px] font-bold text-white mb-1">Caretaker</h3>
            <p className="text-[#525252] text-[12px] leading-relaxed mb-3">Elderly care, patient care</p>
            <div className="text-[#a855f7] font-bold text-[14px]">From ₹499/day</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="bg-[#080808] py-[80px] px-[20px] md:py-[100px] md:px-[24px]">
        <div className="max-w-[1200px] mx-auto relative">
          <div className="text-center mb-3 uppercase tracking-[2px] font-semibold text-[#F97316] text-[13px]">
            HOW IT WORKS
          </div>
          <h2 className="text-[40px] font-bold text-white text-center mb-[60px] md:mb-[80px]">
            Book in 3 simple steps
          </h2>

          {/* Desktop Line Connectors */}
          <div 
            className="hidden md:block absolute h-[1px] z-0"
            style={{
              top: '190px', // Adjusted visually roughly based on spacing calculations
              left: 'calc(16.66% + 24px)',
              right: 'calc(16.66% + 24px)',
              background: 'linear-gradient(90deg, #F97316, #2a2a2a, #F97316)'
            }}
          />

          <div className="flex flex-col md:grid md:grid-cols-3 gap-[40px] md:gap-[32px]">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-[48px] h-[48px] rounded-full border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[18px] font-bold text-[#F97316] shrink-0 md:mb-[24px]">
                1
              </div>
              <div className="flex flex-col md:items-center">
                <div className="hidden md:flex w-[40px] h-[40px] rounded-[10px] bg-[rgba(249,115,22,0.1)] items-center justify-center mb-4">
                  <Search className="text-[#F97316]" size={20} />
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-[8px]">Choose a service</h3>
                <p className="text-[#525252] text-[14px] leading-[1.6]">
                  Pick from our categories — maid, electrician, plumber or caretaker
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-[48px] h-[48px] rounded-full border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[18px] font-bold text-[#F97316] shrink-0 md:mb-[24px]">
                2
              </div>
              <div className="flex flex-col md:items-center">
                <div className="hidden md:flex w-[40px] h-[40px] rounded-[10px] bg-[rgba(249,115,22,0.1)] items-center justify-center mb-4">
                  <Users className="text-[#F97316]" size={20} />
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-[8px]">Select a provider</h3>
                <p className="text-[#525252] text-[14px] leading-[1.6]">
                  Browse verified profiles, ratings and reviews
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-[48px] h-[48px] rounded-full border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[18px] font-bold text-[#F97316] shrink-0 md:mb-[24px]">
                3
              </div>
              <div className="flex flex-col md:items-center">
                <div className="hidden md:flex w-[40px] h-[40px] rounded-[10px] bg-[rgba(249,115,22,0.1)] items-center justify-center mb-4">
                  <CheckCircle className="text-[#F97316]" size={20} />
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-[8px]">Get it done</h3>
                <p className="text-[#525252] text-[14px] leading-[1.6]">
                  Your provider arrives on time, every time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - TRUST BADGES */}
      <section className="bg-[#0a0a0a] py-[80px] px-[20px] md:py-[100px] md:px-[24px] border-t border-[#2a2a2a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-3 uppercase tracking-[2px] font-semibold text-[#F97316] text-[13px]">
            WHY CHOOSE US
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-white text-center mb-[60px] md:mb-[80px]">
            Built for trust, designed for India
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-[20px] p-[32px_28px] transition-all duration-300 hover:border-[rgba(249,115,22,0.4)] hover:bg-[#141414]">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[rgba(249,115,22,0.1)] flex items-center justify-center mb-[20px]">
                <ShieldCheck className="text-[#F97316]" size={24} />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-[8px]">Verified Providers</h3>
              <p className="text-[#525252] text-[14px] leading-[1.7]">
                Every provider is background checked, ID verified, and trained before joining ServiceSetu
              </p>
            </div>

            <div className="bg-[#111111] border border-[#2a2a2a] rounded-[20px] p-[32px_28px] transition-all duration-300 hover:border-[rgba(249,115,22,0.4)] hover:bg-[#141414]">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[rgba(249,115,22,0.1)] flex items-center justify-center mb-[20px]">
                <Star className="text-[#F97316]" size={24} />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-[8px]">4.8★ Average Rating</h3>
              <p className="text-[#525252] text-[14px] leading-[1.7]">
                Join thousands of happy customers who trust ServiceSetu for their home service needs
              </p>
            </div>

            <div className="bg-[#111111] border border-[#2a2a2a] rounded-[20px] p-[32px_28px] transition-all duration-300 hover:border-[rgba(249,115,22,0.4)] hover:bg-[#141414]">
              <div className="w-[52px] h-[52px] rounded-[12px] bg-[rgba(249,115,22,0.1)] flex items-center justify-center mb-[20px]">
                <BadgeCheck className="text-[#F97316]" size={24} />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-[8px]">100% Money Back</h3>
              <p className="text-[#525252] text-[14px] leading-[1.7]">
                Not satisfied with the service? We guarantee a full refund, no questions asked
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 - CTA BANNER */}
      <section 
        className="relative py-[80px] px-[20px] md:py-[100px] md:px-[24px] text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
          borderTop: '1px solid #2a2a2a',
          borderBottom: '1px solid #2a2a2a'
        }}
      >
        {/* Background Decoration */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-[800px] mx-auto">
          <div 
            className="inline-block mb-[24px] font-medium text-[13px] rounded-full px-[16px] py-[6px] text-[#F97316]"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
            }}
          >
            Limited Time: Get ₹50 off your first booking
          </div>

          <h2 className="text-[32px] md:text-[48px] font-extrabold text-white mb-[16px] tracking-[-1.5px]">
            Ready to get started?
          </h2>
          
          <p className="text-[#525252] text-[17px] mb-[40px]">
            Join 10,000+ families who trust ServiceSetu
          </p>

          <button
            onClick={() => navigate('/home')}
            className="bg-[#F97316] text-white rounded-[12px] text-[17px] font-semibold transition-all duration-200 hover:bg-[#ea6c0a] hover:shadow-[0_8px_40px_rgba(249,115,22,0.4)] hover:-translate-y-[2px] py-[16px] px-[40px] min-h-[44px]"
          >
            Book Your First Service →
          </button>

          <p className="text-[13px] text-[#525252] mt-[16px]">
            No registration required to browse providers
          </p>
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer className="bg-[#080808] pt-[60px] px-[24px] pb-[30px] border-t border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:grid md:grid-cols-3 gap-[40px] md:gap-[48px]">
          {/* Column 1 */}
          <div>
            <div className="text-[20px] font-bold text-[#F97316] mb-[12px]">ServiceSetu</div>
            <p className="text-[#525252] text-[14px] leading-[1.6] max-w-[220px]">
              Trusted home services at your doorstep
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col md:items-center">
            <div className="w-full md:w-auto">
              <div className="text-[#a3a3a3] text-[12px] font-semibold uppercase tracking-[1.5px] mb-[16px]">
                Company
              </div>
              <div className="flex flex-col gap-[12px]">
                <button className="text-[14px] text-[#525252] hover:text-white transition-colors duration-200 text-left bg-transparent border-none p-0 cursor-pointer">About</button>
                <button className="text-[14px] text-[#525252] hover:text-white transition-colors duration-200 text-left bg-transparent border-none p-0 cursor-pointer">Services</button>
                <button onClick={() => navigate('/register')} className="text-[14px] text-[#525252] hover:text-white transition-colors duration-200 text-left bg-transparent border-none p-0 cursor-pointer">Become a Provider</button>
                <button className="text-[14px] text-[#525252] hover:text-white transition-colors duration-200 text-left bg-transparent border-none p-0 cursor-pointer">Contact</button>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col md:items-end">
            <div className="w-full md:w-auto md:text-right">
              <div className="text-[#a3a3a3] text-[12px] font-semibold uppercase tracking-[1.5px] mb-[16px]">
                Get in touch
              </div>
              <div className="text-[#F97316] text-[14px] mb-[4px]">support@servicesetu.in</div>
              <div className="text-[#525252] text-[12px]">Available 9am - 9pm IST</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-[1200px] mx-auto mt-[48px] pt-[24px] border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between gap-[8px] md:gap-0">
          <div className="text-[#525252] text-[13px]">
            © 2025 ServiceSetu. All rights reserved.
          </div>
          <div className="text-[#525252] text-[13px]">
            Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
