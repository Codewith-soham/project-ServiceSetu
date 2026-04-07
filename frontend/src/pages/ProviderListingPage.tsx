import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Star, MapPin, ChevronLeft, Search, Filter } from 'lucide-react';
import { services } from '../data/mockData';
import { providerApi } from '../services/apiClient.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PROVIDER_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';

const ProviderListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const userLocation = (user?.location ?? '').trim();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providersData, setProvidersData] = useState<any[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const useNearby = Boolean(isAuthenticated && userLocation);

        const response = useNearby
          ? await providerApi.getNearbyProviders({
              address: userLocation,
              radius: 5000,
              serviceType: serviceId || undefined,
              page: 1,
              limit: 50,
            })
          : await providerApi.getProviders(1, {
              serviceType: serviceId || undefined,
              limit: 50,
            });

        const list = Array.isArray(response?.data?.data) ? response.data.data : [];
        setProvidersData(list);
      } catch (err: any) {
        setError(err?.message || 'Failed to load providers');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [isAuthenticated, userLocation, serviceId]);
  
  const currentService = services.find(s => s.id === serviceId);
  const filteredProviders = serviceId
    ? providersData.filter((p) => p.serviceType === serviceId)
    : providersData;

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors text-sm font-medium"
          >
            <ChevronLeft size={16} />
            Back to Services
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold flex items-center gap-4">
              {currentService?.name || 'All Professionals'} 
              <span className="text-lg font-normal text-[#4B5563]">({filteredProviders.length} listed)</span>
            </h1>
            <p className="text-[#9CA3AF] max-w-xl text-lg leading-relaxed">
              Find the top-rated {currentService?.name.toLowerCase() || 'service providers'} in your area.
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-initial gap-2">
            <Filter size={18} />
              Filters
            </Button>
            <Button variant="outline" className="flex-1 md:flex-initial gap-2">
              Sort By: Recommended
            </Button>
          </div>
        </div>  

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && <div className="col-span-full text-center text-[#9CA3AF]">Loading providers...</div>}
        {error && <div className="col-span-full text-center text-red-400">{error}</div>}
        {!loading && !error && filteredProviders.map((provider) => (
          <Card key={provider.id} className="p-0 overflow-hidden flex flex-col group border border-white/5 active:scale-[0.98] transition-transform">
            <div className="h-56 relative overflow-hidden">
              <img 
                src={provider.image || DEFAULT_PROVIDER_IMAGE}
                alt={provider.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white">{provider.rating}</span>
              </div>
            </div>

            <div className="p-8 space-y-6 flex-grow flex flex-col">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold">{provider.name}</h3>
                  <span className="bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {provider.price ? `₹${provider.price}` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {provider.location || 'Location unavailable'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="text-[#2563EB]" />
                    {provider.totalReviews ?? 0} Reviews
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4B5563] font-medium">Experience</span>
                  <span className="text-white font-semibold">{provider.experience || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4B5563] font-medium">Service</span>
                  <span className="text-white font-semibold">{provider.service || provider.serviceType}</span>
                </div>
                <Button 
                  size="full" 
                  className="mt-6 font-bold"
                  onClick={() =>
                    navigate(
                      isAuthenticated
                        ? `/provider/${provider.id || provider._id}`
                        : '/login'
                    )
                  }
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="py-24 text-center space-y-6 bg-white/5 rounded-[30px] border border-dashed border-white/10">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={48} className="text-[#4B5563]" />
          </div>
          <h3 className="text-3xl font-bold text-white">No providers available</h3>
          <p className="text-[#9CA3AF] max-w-sm mx-auto">
            Unfortunately, we don't have any professionals listed for this category yet. Please try another service.
          </p>
          <Button variant="outline" onClick={() => navigate('/services')} className="px-12">
            Back to All Services
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProviderListingPage;
