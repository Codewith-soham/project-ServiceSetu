import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { services } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import ServiceIcon from '../components/ui/ServiceIcon';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('service') || '');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priceRange, setPriceRange] = useState(500);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-72 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Filter size={20} className="text-[#2563EB]" />
              Filters
            </h3>
            
            <div className="space-y-6 pt-4 border-t border-white/5">
              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#9CA3AF]">Price Range</span>
                  <span className="text-xs text-[#2563EB] font-bold">Max ₹{priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50" 
                  className="w-full h-1.5 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-[#4B5563]">
                  <span>₹0</span>
                  <span>₹1000</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-[#9CA3AF]">Minimum Rating</span>
                <div className="flex flex-col gap-2">
                  {['all', '4.5+', '4.0+', '3.5+'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatingFilter(r)}
                      className={`text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        ratingFilter === r ? 'bg-[#2563EB] text-white' : 'glass text-[#9CA3AF] hover:bg-white/5'
                      }`}
                    >
                      {r === 'all' ? 'All Ratings' : `${r} Stars`}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="full" onClick={() => {
                setSearchTerm('');
                setRatingFilter('all');
                setPriceRange(500);
              }}>
                Reset All Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Explore All Services</h1>
              <p className="text-[#9CA3AF]">Browse through our specialized categories</p>
            </div>
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563]" size={18} />
              <input 
                type="text" 
                placeholder="Search services..."
                className="w-full h-12 glass pl-12 pr-4 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                interactive 
                className="group p-8 flex flex-col items-center text-center blue-glow-hover"
                onClick={() => navigate(isAuthenticated ? `/providers?service=${service.id}` : '/login')}
              >
                <div className={`w-14 h-14 ${service.bg} rounded-xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                  <ServiceIcon icon={service.icon} size={28} className={service.color} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#2563EB] transition-colors">{service.name}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center gap-1 text-[#2563EB] text-xs font-bold uppercase tracking-widest mt-auto">
                  View Providers
                  <ChevronRight size={14} />
                </div>
              </Card>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-[#4B5563]" />
              </div>
              <h3 className="text-2xl font-bold text-white">No services found</h3>
              <p className="text-[#9CA3AF]">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
