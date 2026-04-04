import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Calendar, Clock, MapPin, FileEdit, ArrowLeft, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, package: pkg } = location.state || {};
  
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '',
    notes: ''
  });

  if (!provider || !pkg) {
    return <div className="p-32 text-center text-3xl font-bold">Booking Session Expired. Please start again.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/payment', { state: { provider, package: pkg, booking: bookingData } });
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
                  <Input 
                    label="Select Time" 
                    type="time" 
                    required 
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">Service Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-[#4B5563]" size={18} />
                    <textarea 
                      required
                      className="w-full rounded-xl border border-[#334155] bg-[#0F172A] pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[120px] transition-all"
                      placeholder="Enter the full address where service is required..."
                      value={bookingData.address}
                      onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
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
                <Button type="submit" size="lg" className="w-full h-16 text-lg font-bold">
                  Proceed to Payment Selection
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
                  <img src={provider.image} className="w-full h-full object-cover" />
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
                  <span className="text-[#9CA3AF]">Subtotal</span>
                  <span className="text-white font-bold">${pkg.price}</span>
                </div>
                <div className="flex justify-between text-xl pt-4 border-t border-white/10 text-[#2563EB] font-black">
                  <span>Total</span>
                  <span>${pkg.price}</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                <p className="text-[10px] text-yellow-400 leading-relaxed text-center font-bold">
                  No hidden charges. Cancellation policy applies after booking.
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
