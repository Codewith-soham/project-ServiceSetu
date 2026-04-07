import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, BadgeIndianRupee, CircleCheck, ReceiptText, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { paymentApi } from '../services/apiClient';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const ensureRazorpayLoaded = async () => {
  if (window.Razorpay) return true;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load payment SDK'));
    document.body.appendChild(script);
  });

  return Boolean(window.Razorpay);
};

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = location.state?.order;
  const breakdown = order?.breakdown;

  const bill = useMemo(() => {
    const basePrice = Number(breakdown?.basePrice || 0);
    const platformFee = Number(breakdown?.platformFee || 0);
    const razorpayFee = Number(breakdown?.razorpayFee || 0);
    const roundUpMargin = Number(breakdown?.roundUpMargin || 0);
    const customerTotal = Number(breakdown?.customerTotal || 0);
    const providerPayout = Number(breakdown?.providerPayout || 0);

    return {
      basePrice,
      platformFee,
      razorpayFee,
      roundUpMargin,
      customerTotal,
      providerPayout,
    };
  }, [breakdown]);

  const payNow = async () => {
    try {
      setError(null);
      setIsPaying(true);

      if (!order?.razorpayOrderId || !order?.amount) {
        throw new Error('Payment order missing. Please create booking again.');
      }

      if (!order?.razorpayKeyId) {
        throw new Error('Payment key is not configured on server. Please contact support.');
      }

      const loaded = await ensureRazorpayLoaded();
      if (!loaded || !window.Razorpay) {
        throw new Error('Razorpay SDK not available. Please retry.');
      }

      const options = {
        key: order?.razorpayKeyId,
        amount: order.amount,
        currency: 'INR',
        order_id: order.razorpayOrderId,
        name: 'ServiceSetu',
        description: 'Service booking payment',
        notes: {
          bookingId: order.bookingId,
        },
        handler: async (response: any) => {
          await paymentApi.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          navigate('/user/dashboard?tab=bookings', {
            state: {
              paymentSuccess: true,
              bookingId: order.bookingId,
            },
          });
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (failure: any) => {
        setError(failure?.error?.description || 'Payment failed. Please retry.');
      });
      razorpay.open();
    } catch (err: any) {
      setError(err?.message || 'Unable to initiate payment');
    } finally {
      setIsPaying(false);
    }
  };

  if (!order?.bookingId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 animate-fade-in">
        <Card className="max-w-2xl w-full p-10 md:p-12 text-center space-y-6 glass blue-glow">
          <h1 className="text-3xl md:text-4xl font-bold">Payment Session Missing</h1>
          <p className="text-[#9CA3AF] leading-relaxed">
            We could not find your payment order. Please restart booking.
          </p>
          <Button onClick={() => navigate('/services')} className="h-12">Back to Services</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-8 animate-fade-in">
      <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 md:p-10 space-y-8 glass blue-glow">
          <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
            <ReceiptText size={18} className="text-[#2563EB]" />
            Professional invoice preview before payment
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">Complete Your Payment</h1>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Service Amount</span>
              <span className="font-bold">₹{bill.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Platform Commission (2%)</span>
              <span className="font-bold">₹{bill.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Payment Gateway Charges</span>
              <span className="font-bold">₹{bill.razorpayFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9CA3AF]">Adaptive Round-up Margin</span>
              <span className="font-bold">₹{bill.roundUpMargin.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-lg">
              <span className="font-semibold">Total Payable</span>
              <span className="font-black text-[#2563EB]">₹{bill.customerTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={() => navigate(-1)} variant="ghost" className="h-12 inline-flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button onClick={payNow} className="h-12 inline-flex items-center justify-center gap-2" disabled={isPaying}>
              <BadgeIndianRupee size={16} />
              {isPaying ? 'Opening Razorpay...' : 'Pay Securely'}
            </Button>
          </div>
        </Card>

        <Card className="p-8 space-y-5 glass">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-500" size={20} />
            <p className="font-semibold">Payout Guarantee</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-xs uppercase tracking-widest text-green-400">Provider receives</p>
            <p className="text-2xl font-black text-green-400">₹{bill.providerPayout.toFixed(2)}</p>
          </div>
          <div className="text-sm text-[#9CA3AF] space-y-3">
            <p className="flex items-start gap-2"><CircleCheck size={16} className="text-green-500 mt-0.5" />Transparent invoice with itemized charges</p>
            <p className="flex items-start gap-2"><CircleCheck size={16} className="text-green-500 mt-0.5" />Provider payout protected from fee fluctuations</p>
            <p className="flex items-start gap-2"><CircleCheck size={16} className="text-green-500 mt-0.5" />Adaptive pricing policy supports growth</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
