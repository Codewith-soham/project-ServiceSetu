import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Star, Zap, Droplets, SprayCan, Wrench } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?service=${searchService}&location=${searchLocation}`);
  };

  const popularServices = [
    { name: 'Electrician', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Plumber', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Cleaning', icon: SprayCan, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Repair', icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const featuredProviders = [
    { id: '1', name: 'Alex Johnson', service: 'Master Electrician', rating: 4.9, reviews: 124, image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop' },
    { id: '2', name: 'Maria Garcia', service: 'Professional Cleaner', rating: 4.8, reviews: 89, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
    { id: '3', name: 'David Chen', service: 'Plumbing Expert', rating: 5.0, reviews: 56, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-8 md:px-16 flex flex-col items-center text-center min-h-[80vh] justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/src/assets/hero-bg.png")' }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0F172A]/80 via-[#0F172A]/60 to-[#0F172A]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-[#2563EB]/5 rounded-full blur-[120px] -z-10" />
        
        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight mb-6">
          Find Professional Services <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#3B82F6]">
            At Your Doorstep
          </span>
        </h1>
        <p className="text-[#9CA3AF] text-lg md:text-xl max-w-2xl mb-12">
          Connecting you with trusted, verified local experts for all your home and business needs. Reliable, fast, and secure.
        </p>

        <form 
          onSubmit={handleSearch}
          className="w-full max-w-4xl glass p-2 rounded-[20px] flex flex-col md:flex-row gap-2 blue-glow-hover"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563]" size={18} />
            <input 
              type="text" 
              placeholder="What service do you need?"
              className="w-full h-14 bg-transparent pl-12 pr-4 focus:outline-none text-white text-sm"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
          </div>
          <div className="hidden md:block w-[1px] h-10 bg-white/10 self-center" />
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563]" size={18} />
            <input 
              type="text" 
              placeholder="Your location"
              className="w-full h-14 bg-transparent pl-12 pr-4 focus:outline-none text-white text-sm"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="md:w-32">
            Search
          </Button>
        </form>
      </section>

      {/* Popular Services Section */}
      <section className="py-20 px-8 md:px-16 container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Popular Services</h2>
            <p className="text-[#9CA3AF]">Most requested home services in your area</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/services')}>View All</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service) => (
            <Card 
              key={service.name} 
              interactive 
              onClick={() => navigate(isAuthenticated ? '/services' : '/login-choice')}
              className="flex flex-col items-center text-center py-10 group"
            >
              <div className={`w-16 h-16 ${service.bg} rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={service.color} size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                Expert solutions for your {service.name.toLowerCase()} needs.
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-20 px-8 md:px-16 bg-[#111827]/50 border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Rated Providers</h2>
            <p className="text-[#9CA3AF] max-w-2xl mx-auto">Verified professionals with a track record of excellence and reliability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <Card key={provider.id} className="p-0 overflow-hidden flex flex-col blue-glow-hover">
                <div className="h-48 overflow-hidden relative">
                  <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">{provider.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{provider.name}</h3>
                  <p className="text-[#2563EB] text-sm font-medium mb-4">{provider.service}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <span className="text-[#4B5563] text-xs uppercase tracking-wider font-bold">{provider.reviews} Reviews</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(isAuthenticated ? `/provider/${provider.id}` : '/login-choice')}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-20 px-8 md:px-16 container mx-auto">
        <div className="relative rounded-[30px] overflow-hidden bg-[#2563EB] blue-glow">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-4">
              <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[2px]">Limited Time Offer</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Get <span className="text-blue-200">20% Off</span> Your <br className="hidden md:block" /> First Service Booking
              </h2>
              <p className="text-blue-100 max-w-lg">
                Experience premium service at a special price. Use code SETU20 at checkout.
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-[#2563EB] hover:bg-blue-50 h-16 px-12 text-lg shadow-2xl"
              onClick={() => navigate('/services')}
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
