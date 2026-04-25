import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { MapPin, FileEdit, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/apiClient';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  const paddedHour24 = String(hour24).padStart(2, '0');
  const paddedHour = String(hour12).padStart(2, '0');
  const paddedMinute = String(minute).padStart(2, '0');

  return {
    value: `${paddedHour24}:${paddedMinute}`,
    label: `${hour12}:${paddedMinute} ${period}`,
  };
});

const DEFAULT_PROVIDER_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { provider, package: pkg } = location.state || {};
  const basePrice = Number(pkg?.basePrice ?? pkg?.price ?? provider?.price ?? 0);
  const packagePrice = Number(pkg?.price ?? basePrice);
  
  const [usePermanentAddress, setUsePermanentAddress] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '09:00',
    flatOrHouse: '',
    buildingOrApt: '',
    area: '',
    city: '',
    pincode: '',
    landmark: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse permanent address from user profile
  const parseAddressFields = (fullAddress: string) => {
    if (!fullAddress || typeof fullAddress !== 'string') {
      return null;
    }

    // Try to parse if formatted as "Flat, Building, Landmark, Area, City, Pincode"
    const parts = fullAddress.split(',').map(p => p.trim());
    
    if (parts.length >= 4) {
      return {
        flatOrHouse: parts[0] || '',
        buildingOrApt: parts[1] || '',
        landmark: parts.find(p => p.startsWith('Landmark:'))?.replace('Landmark:', '').trim() || '',
        area: parts.find(p => p && !p.startsWith('Landmark:') && !p.match(/^\d{6}$/)) || parts[2] || '',
        city: parts.length > 3 ? parts[parts.length - 2] : '',
        pincode: parts.find(p => p.match(/^\d{6}$/)) || ''
      };
    }

    // Fallback: treat whole address as area/city
    return {
      flatOrHouse: '',
      buildingOrApt: '',
      landmark: '',
      area: fullAddress,
      city: '',
      pincode: ''
    };
  };

  // Handle checkbox toggle
  useEffect(() => {
    if (usePermanentAddress && user?.location) {
      const parsed = parseAddressFields(user.location);
      if (parsed) {
        setBookingData(prev => ({
          ...prev,
          flatOrHouse: parsed.flatOrHouse,
          buildingOrApt: parsed.buildingOrApt,
          landmark: parsed.landmark,
          area: parsed.area,
          city: parsed.city,
          pincode: parsed.pincode
        }));
      }
    }
  }, [usePermanentAddress, user?.location]);

  if (!provider || !pkg) {
    return <div className="p-32 text-center text-3xl font-bold">Booking Session Expired. Please start again.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!bookingData.date || !bookingData.time) {
        throw new Error('Please select both date and time');
      }

      const addressParts = [
        bookingData.flatOrHouse,
        bookingData.buildingOrApt,
        bookingData.landmark ? `Landmark: ${bookingData.landmark}` : '',
        bookingData.area,
        bookingData.city,
        bookingData.pincode ? `Pincode: ${bookingData.pincode}` : '',
      ]
        .map((v) => String(v || '').trim())
        .filter(Boolean);

      if (addressParts.length < 4) {
        throw new Error('Please enter Flat/House, Area, City and Pincode');
      }

      const formattedAddress = addressParts.join(', ');

      const [year, month, day] = bookingData.date.split('-').map(Number);
      let [hours, minutes] = bookingData.time.split(':').map(Number);

      const localDate = new Date(year, (month || 1) - 1, day, hours, minutes, 0, 0);
      if (Number.isNaN(localDate.getTime())) {
        throw new Error('Invalid booking date or time');
      }

      const bookingDate = localDate.toISOString();
      const payload = {
        providerId: provider.id || provider._id,
        bookingDate,
        note: bookingData.notes,
        address: formattedAddress,
      };

      const response = await bookingApi.createBooking(payload);
      const responseBookingId = response?.data?._id || response?.data?.id;
      if (!responseBookingId) {
        throw new Error('Failed to create booking');
      }

      navigate('/user/dashboard?tab=bookings', {
        state: {
          bookingSuccess: true,
          bookingId: responseBookingId,
        },
      });
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Review Selection
            </button>
            <h1 className="text-4xl font-bold">Finalize Your <span className="text-[#2563EB]">Booking</span></h1>
            <p className="text-[#9CA3AF]">Please provide the necessary details for your service appointment.</p>
          </div>
          <div className="hidden md:flex flex-col items-center gap-2 p-6 glass rounded-2xl">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <ShieldCheck size={28} className="text-green-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Secure Booking</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-10 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Select Date" 
                    type="date" 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#9CA3AF]">Select Time</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        required
                        className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      >
                        {TIME_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[#9CA3AF]">Service Address</label>
                    {user?.location && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                        <input
                          type="checkbox"
                          checked={usePermanentAddress}
                          onChange={(e) => setUsePermanentAddress(e.target.checked)}
                          className="w-4 h-4 rounded border-[#334155] bg-[#0F172A] cursor-pointer accent-[#2563EB]"
                        />
                        <span className="font-bold uppercase tracking-wide">Same as Permanent</span>
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Flat / House No"
                      placeholder="e.g. 12B"
                      icon={<MapPin size={18} className="text-white/40" />}
                      required
                      disabled={usePermanentAddress}
                      value={bookingData.flatOrHouse}
                      onChange={(e) => setBookingData({ ...bookingData, flatOrHouse: e.target.value })}
                    />
                    <Input
                      label="Building / Apt Name"
                      placeholder="e.g. Sky Heights"
                      required
                      disabled={usePermanentAddress}
                      value={bookingData.buildingOrApt}
                      onChange={(e) => setBookingData({ ...bookingData, buildingOrApt: e.target.value })}
                    />
                    <Input
                      label="Area / Locality"
                      placeholder="e.g. Andheri West"
                      required
                      disabled={usePermanentAddress}
                      value={bookingData.area}
                      onChange={(e) => setBookingData({ ...bookingData, area: e.target.value })}
                    />
                    <Input
                      label="City"
                      placeholder="e.g. Mumbai"
                      required
                      disabled={usePermanentAddress}
                      value={bookingData.city}
                      onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                    />
                    <Input
                      label="Pincode"
                      placeholder="e.g. 400058"
                      inputMode="numeric"
                      required
                      disabled={usePermanentAddress}
                      value={bookingData.pincode}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                    />
                    <Input
                      label="Landmark (Optional)"
                      placeholder="e.g. Near City Mall"
                      disabled={usePermanentAddress}
                      value={bookingData.landmark}
                      onChange={(e) => setBookingData({ ...bookingData, landmark: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">Additional Notes (Optional)</label>
                  <div className="relative">
                    <FileEdit className="absolute left-4 top-4 text-[#4B5563]" size={18} />
                    <textarea 
                      className="w-full rounded-xl border border-[#334155] bg-[#0F172A] pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[100px] transition-all"
                      placeholder="Any specific instructions for the professional?"
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full h-16 text-lg font-bold" disabled={loading}>
                  {loading ? 'Creating Booking...' : 'Book Now'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Selection Summary Sidebar */}
          <aside>
            <Card className="p-8 space-y-8 glass-dark sticky top-32">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Booking Summary</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                  <img src={provider.image || DEFAULT_PROVIDER_IMAGE} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{provider.name}</h4>
                  <p className="text-xs text-[#2563EB] font-bold uppercase tracking-wider">{provider.service}</p>
                </div>
              </div>

              <div className="space-y-4 py-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">Selected Package</span>
                  <span className="text-white font-bold">{pkg.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">Duration</span>
                  <span className="text-white font-bold">{pkg.time}</span>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                  <span className="text-[#9CA3AF]">Base Value</span>
                  <span className="text-white font-bold">₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">Package Price</span>
                  <span className="text-white font-bold">₹{packagePrice}</span>
                </div>
                <div className="flex justify-between text-xl pt-4 border-t border-white/10 text-[#2563EB] font-black">
                  <span>Total</span>
                  <span>₹{packagePrice}</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                <p className="text-[10px] text-yellow-400 leading-relaxed text-center font-bold">
                  No payment is required right now. Cancellation policy applies after booking.
                </p>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
