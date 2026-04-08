import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, MapPin, CheckCircle, ShieldCheck, Clock, ArrowLeft, MessageSquare } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { providerApi, reviewApi } from '../services/apiClient';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';

const buildDefaultPackages = (provider: any) => {
  const basePrice = Number(provider?.price ?? 0);
  const safePrice = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 500;

  return [
    {
      id: `pkg-basic-${provider?.id || 'default'}`,
      name: 'Standard Visit',
      price: safePrice,
      time: '1-2 hrs',
      features: [
        'On-site inspection',
        'Service execution',
        'Work completion summary',
      ],
    },
  ];
};

const ProviderDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [provider, setProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('packages');
  const [msgSent, setMsgSent] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const canShowReviewInfo = user?.role !== 'provider';

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) {
        setLoadError('Invalid provider id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        const response = await providerApi.getProviderById(id);
        const apiProvider = response?.data;

        if (!apiProvider) {
          throw new Error('Provider not found');
        }

        const normalizedProvider = {
          id: String(apiProvider.id ?? id),
          name: apiProvider.name || 'Service Provider',
          service: apiProvider.service || apiProvider.serviceType || 'General Service',
          serviceType: apiProvider.serviceType || 'general',
          rating: apiProvider.rating ?? 0,
          reviews: apiProvider.totalReviews ?? 0,
          price: apiProvider.price ?? null,
          pricing: apiProvider.price ? `₹${apiProvider.price}` : 'Contact for pricing',
          location: apiProvider.location || 'Location unavailable',
          experience: apiProvider.experience || 'N/A',
          bio:
            apiProvider.bio ||
            `Experienced ${apiProvider.serviceType || 'service'} professional available for bookings.`,
          image: apiProvider.image || FALLBACK_IMAGE,
          packages:
            Array.isArray(apiProvider.packages) && apiProvider.packages.length > 0
              ? apiProvider.packages
              : buildDefaultPackages(apiProvider),
        };

        setProvider(normalizedProvider);
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load provider');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || activeTab !== 'reviews' || !canShowReviewInfo) {
        return;
      }

      if (!isAuthenticated) {
        setReviewsError('Login as a customer to view reviews.');
        setReviews([]);
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const response = await reviewApi.getProviderReviews(id, 1, 10);
        setReviews(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (err: any) {
        setReviews([]);
        setReviewsError(err?.message || 'Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [activeTab, id, isAuthenticated, canShowReviewInfo]);

  if (loading) {
    return (
      <div className="p-32 text-center text-2xl font-bold text-[#9CA3AF]">Loading provider...</div>
    );
  }

  if (!provider || loadError) {
    return <div className="p-32 text-center text-3xl font-bold">Provider Not Found</div>;
  }

  const handleBooking = (pkg: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { provider, package: pkg } });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors mb-10 text-sm font-medium w-fit"
      >
        <ArrowLeft size={16} />
        Back to Listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header Card */}
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 h-64 rounded-[30px] overflow-hidden blue-glow border border-white/5">
              <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <h1 className="text-4xl font-bold">{provider.name}</h1>
                  <span className="bg-[#2563EB] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 w-fit">
                    <ShieldCheck size={14} />
                    Verified Pro
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-[#9CA3AF]">
                  {canShowReviewInfo && (
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{provider.rating}</span>
                      <span className="text-xs">({provider.reviews} Reviews)</span>
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <MapPin size={16} className="text-[#2563EB]" />
                    {provider.location}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle size={16} className="text-green-500" />
                    {provider.experience} Exp.
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                {(canShowReviewInfo ? ['About', 'Packages', 'Reviews'] : ['About', 'Packages']).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                      activeTab === tab.toLowerCase() 
                        ? 'bg-[#2563EB] text-white blue-glow shadow-xl' 
                        : 'glass text-[#9CA3AF] hover:text-[#2563EB]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Tab Content */}
          <section className="animate-fade-in pt-4">
            {activeTab === 'about' && (
              <div className="space-y-8 glass p-10 rounded-[30px] border border-white/5">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">About the Professional</h3>
                  <p className="text-[#9CA3AF] leading-relaxed text-lg italic">"{provider.bio}"</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Core Skills</h4>
                  <div className="flex flex-wrap gap-3">
                    {['Circuitry', 'Wiring', 'Safety Protocols', 'Component Repair', 'Troubleshooting'].map((skill) => (
                      <span key={skill} className="bg-white/5 px-4 py-2 rounded-xl text-sm text-[#F9FAFB] border border-white/10">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold ml-2">Choose a Service Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {provider.packages.map((pkg) => (
                    <Card key={pkg.id} className="p-8 flex flex-col space-y-6 relative overflow-hidden group blue-glow-hover">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-[100px] -z-10 group-hover:bg-[#2563EB]/10 transition-colors" />
                      
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold">{pkg.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-[#4B5563] font-black uppercase tracking-[2px]">
                            <Clock size={12} className="text-[#2563EB]" />
                            {pkg.time} Est.
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-[#2563EB] group-hover:scale-110 transition-transform">₹{pkg.price}</div>
                      </div>

                      <ul className="space-y-3 flex-grow">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Button size="full" onClick={() => handleBooking(pkg)}>
                        Book Now
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="glass p-10 rounded-[30px] space-y-6">
                <h3 className="text-2xl font-bold">Client Testimonials</h3>

                {reviewsLoading && (
                  <p className="text-[#9CA3AF]">Loading reviews...</p>
                )}

                {!reviewsLoading && reviewsError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {reviewsError}
                  </div>
                )}

                {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                  <p className="text-[#9CA3AF]">No reviews yet for this provider.</p>
                )}

                {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review._id} className="p-5 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-white font-semibold">{review?.user?.fullname || 'Customer'}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= Number(review.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-[#4B5563]'}
                              />
                            ))}
                          </div>
                        </div>
                        {review?.comment && (
                          <p className="text-sm text-[#9CA3AF]">{review.comment}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Profile Card */}
        <aside className="space-y-8">
          <Card className="p-10 flex flex-col items-center text-center space-y-8 glass-dark sticky top-32">
            <h3 className="text-2xl font-bold">Work with {provider.name.split(' ')[0]}</h3>
            <div className="w-full space-y-4 py-8 border-y border-white/5">
              {canShowReviewInfo && (
                <>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[#9CA3AF] text-sm">Rating</span>
                    <span className="text-white font-bold flex items-center gap-2">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {provider.rating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[#9CA3AF] text-sm">Reviews</span>
                    <span className="text-white font-bold">{provider.reviews}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center px-4">
                <span className="text-[#9CA3AF] text-sm">Pricing</span>
                <span className="text-[#2563EB] font-bold text-lg">{provider.pricing}</span>
              </div>
            </div>

            <div className="w-full space-y-4 pt-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-left mb-6">Contact Professional</h4>
              {msgSent ? (
                <div className="bg-green-500/10 text-green-500 p-4 rounded-xl text-center text-sm font-bold animate-fade-in flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Message Sent Successfully!
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea 
                    className="w-full rounded-xl border border-[#334155] bg-transparent p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder:text-[#4B5563]"
                    placeholder="Tell us about your project..."
                    rows={4}
                  />
                  <Button type="submit" variant="outline" size="full" className="gap-2 font-bold group">
                    <MessageSquare size={18} className="group-hover:text-[#2563EB] transition-colors" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
            
            <p className="text-[10px] text-[#4B5563] leading-relaxed">
              * By contacting the provider, you agree to our privacy policy and data usage terms.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;
