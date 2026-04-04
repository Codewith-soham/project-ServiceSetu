import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle, ArrowLeft, ChevronRight, Lock, Calendar, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, package: pkg, booking } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!provider || !pkg || !booking) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-3xl font-bold text-white">Session Expired</div>
        <p className="text-[#9CA3AF]">Please select a service and package again to proceed.</p>
        <Button onClick={() => navigate('/services')}>Return to Services</Button>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 animate-fade-in">
        <Card className="max-w-md w-full p-12 text-center space-y-8 glass blue-glow">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 scale-animation">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Booking Confirmed!</h2>
            <p className="text-[#9CA3AF]">
              Your service with <span className="text-white font-bold">{provider.name}</span> has been scheduled for <span className="text-white font-bold">{booking.date}</span> at <span className="text-white font-bold">{booking.time}</span>.
            </p>
          </div>
          <div className="pt-8 space-y-4">
            <Button size="full" onClick={() => navigate('/user/dashboard')}>
              Go to My Dashboard
            </Button>
            <p className="text-xs text-[#4B5563]">Confirmation email sent to your registered address.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Secure <span className="text-[#2563EB]">Payment</span></h1>
          <p className="text-[#9CA3AF]">Complete your booking by selecting a preferred payment method.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Methods */}
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'upi', label: 'UPI', icon: Smartphone, color: 'text-purple-400' },
                { id: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-400' },
                { id: 'cod', label: 'COD', icon: Banknote, color: 'text-green-400' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-4 ${
                    paymentMethod === m.id 
                    ? 'border-[#2563EB] bg-[#2563EB]/10' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <m.icon size={32} className={paymentMethod === m.id ? 'text-[#2563EB]' : m.color} />
                  <span className={`text-sm font-bold ${paymentMethod === m.id ? 'text-white' : 'text-[#9CA3AF]'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            <Card className="p-10 space-y-8 glass-dark relative overflow-hidden active:scale-100">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563EB]/5 rounded-bl-[200px] -z-10" />
              
              <form onSubmit={handlePayment} className="space-y-8">
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Smartphone size={20} className="text-[#2563EB]" />
                      UPI Payment
                    </h3>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <Input label="UPI ID" placeholder="user@okhdfc" required />
                      <p className="text-xs text-[#4B5563]">You'll receive a payment request on your UPI app.</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CreditCard size={20} className="text-[#2563EB]" />
                      Card Details
                    </h3>
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <Input label="Cardholder Name" placeholder="John Doe" required />
                      <Input label="Card Number" placeholder="0000 0000 0000 0000" maxLength={16} required />
                      <div className="grid grid-cols-2 gap-6">
                        <Input label="Expiry Date" placeholder="MM/YY" required />
                        <Input label="CVV" placeholder="***" maxLength={3} type="password" required />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="space-y-6 animate-fade-in py-10 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <Banknote className="text-green-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Cash on Delivery</h3>
                    <p className="text-[#9CA3AF] max-w-sm mx-auto">
                      Pay directly to the professional after the service is completed to your satisfaction.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-center gap-2 text-[#4B5563] text-xs font-bold uppercase tracking-widest">
                    <Lock size={14} className="text-[#2563EB]" />
                    SSL Secured Payment
                  </div>
                  <Button type="submit" size="full" className="h-16 text-lg font-black group" disabled={processing}>
                    {processing ? 'Processing...' : (
                      <span className="flex items-center justify-center gap-3">
                        Pay ${pkg.price}
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Checkout Info */}
          <aside className="space-y-8">
            <Card className="p-8 space-y-8 glass shadow-2xl sticky top-32 border-none">
              <h3 className="text-xl font-bold">Checkout Summary</h3>
              
              <div className="space-y-6 py-6 border-y border-white/5">
                <div className="space-y-2">
                  <span className="text-[#4B5563] text-[10px] font-black uppercase tracking-widest">Service & Professional</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                      <img src={provider.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{provider.name}</h4>
                      <p className="text-[#2563EB] text-[10px] font-bold uppercase">{pkg.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[#4B5563] text-[10px] font-black uppercase tracking-widest">Schedule</span>
                  <div className="flex items-center gap-6 text-xs text-white font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-[#2563EB]" />{booking.date}</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-[#2563EB]" />{booking.time}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[#4B5563] text-[10px] font-black uppercase tracking-widest">Pricing</span>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-[#9CA3AF]">Service Charge</span>
                    <span className="text-right text-white font-bold">${pkg.price}</span>
                    <span className="text-[#9CA3AF]">Convenience Fee</span>
                    <span className="text-right text-green-500 font-bold">FREE</span>
                    <span className="text-white font-black text-lg pt-4">Total</span>
                    <span className="text-[#2563EB] font-black text-lg pt-4 text-right">${pkg.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[#9CA3AF] text-[10px]">
                  <ShieldCheck size={16} className="text-[#2563EB]" />
                  100% Secure Transaction
                </div>
                <div className="flex items-center gap-3 text-[#9CA3AF] text-[10px]">
                  <CheckCircle size={16} className="text-[#2563EB]" />
                  Service Quality Guarantee
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
