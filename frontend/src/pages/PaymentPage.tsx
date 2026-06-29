import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentApi } from '../services/apiClient';

interface Breakdown {
  basePrice: number;
  platformFee: number;
  razorpayFee: number;
  roundUpMargin: number;
  providerAmount: number;
  customerTotal: number;
  pricingVersion: string;
}

interface PaymentData {
  bookingId: string;
  razorpayOrderId: string;
  amount: number;
  razorpayKeyId: string;
  breakdown: Breakdown;
}


const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [showQRFallback, setShowQRFallback] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const bookingId = new URLSearchParams(location.search).get('bookingId') ||
                    (location.state as any)?.bookingId;

  useEffect(() => {
    if (!bookingId) {
      toast.error('Booking ID not found');
      navigate('/user/dashboard');
      return;
    }
    initializePayment();
  }, [bookingId]);


  const initializePayment = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.createOrder({ bookingId });
      setPaymentData(response.data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to initialize payment');
      navigate('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayOpen = () => {
    if (!paymentData || !(window as any).Razorpay) {
      toast.error('Payment gateway not available');
      return;
    }

    const options = {
      key: paymentData.razorpayKeyId,
      amount: paymentData.amount,
      currency: 'INR',
      name: 'ServiceSetu',
      description: 'Service Booking Payment',
      order_id: paymentData.razorpayOrderId,
      handler: async (response: any) => {
        try {
          setLoading(true);
          await paymentApi.verifyPayment({
            razorpayOrderId: paymentData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success('Payment successful! Provider notified.');
          navigate('/user/dashboard');
        } catch (error: any) {
          toast.error(error?.message || 'Payment verification failed');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        contact: '',
        email: '',
      },
      theme: {
        color: '#2563EB',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const handleQRPayment = async () => {
    try {
      setQrError(null);
      setQrLoading(true);
      const response = await paymentApi.createQr({ bookingId });
      const payload = response?.data || null;
      const hasQr = Boolean(payload?.qrImageDataUrl || payload?.qrImageUrl);
      if (!hasQr) {
        throw new Error('QR was generated but no image URL was returned by payment gateway');
      }
      setQrData(payload);
      setShowQRFallback(true);
      toast.success('QR code generated. Scan to pay.');
    } catch (error: any) {
      const message = error?.message || 'Failed to generate QR code';
      setQrError(message);
      toast.error(message);
    } finally {
      setQrLoading(false);
    }
  };

  if (loading && !paymentData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-red-400">Failed to load payment details</p>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const breakdown = paymentData?.breakdown;
  const qrImageSrc = qrData?.qrImageDataUrl || qrData?.qrImageUrl || '';

  if (!breakdown) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-red-400">Payment details are incomplete. Please try again.</p>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 animate-fade-in">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 md:p-12 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Complete Payment</h1>
          <p className="text-[#9CA3AF]">Amount: ₹{breakdown.customerTotal.toFixed(2)}</p>
        </div>

        {/* Breakdown */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Service Price</span>
            <span className="font-semibold">₹{breakdown.basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Platform Fee</span>
            <span className="font-semibold">₹{breakdown.platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gateway Fee</span>
            <span className="font-semibold">₹{breakdown.razorpayFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-blue-400">₹{breakdown.customerTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        {!showQRFallback ? (
          <div className="space-y-3">
            <button
              onClick={handleRazorpayOpen}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                'Open Razorpay Checkout'
              )}
            </button>

            <button
              onClick={handleQRPayment}
              disabled={qrLoading}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              {qrLoading ? 'Generating UPI QR...' : 'Generate UPI QR Code'}
            </button>

            <p className="text-xs text-gray-400">
              Use "Generate UPI QR Code" for scan-and-pay. Razorpay checkout may show a separate test-mode QR.
            </p>

            {qrError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {qrError}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center space-y-4">
              {qrImageSrc ? (
                <img
                  src={qrImageSrc}
                  alt="UPI QR Code"
                  className="w-56 h-56 mx-auto border-2 border-blue-500 rounded-2xl p-2 bg-white"
                />
              ) : (
                <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
                  QR image is not available right now. Use Razorpay checkout button above.
                </div>
              )}
              <div className="space-y-2">
                <p className="text-white font-semibold">Scan to Pay with UPI</p>
                <p className="text-gray-400 text-sm">
                  Use any UPI app: Google Pay, PhonePe, PayTm, or BHIM
                </p>
                {qrData?.qrImageUrl && (
                  <a
                    href={qrData.qrImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4"
                  >
                    Open QR in new tab
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowQRFallback(false)}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
            >
              Back to Payment Methods
            </button>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          Payment is secure and processed through Razorpay. Your money is held in escrow and released to the provider only after service completion.
        </div>

        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
