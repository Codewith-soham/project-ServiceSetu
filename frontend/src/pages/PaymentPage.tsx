import React from 'react';

const PaymentPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 animate-fade-in">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 md:p-12 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 text-2xl font-black">
          !
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Payment Temporarily Disabled</h1>
        <p className="text-[#9CA3AF] leading-relaxed">
          Bookings now go directly to the provider without taking payment in the app. If you reached this page from an old link, you can go back and continue with a normal booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            Go Back
          </button>
          <a
            href="/services"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Browse Services
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
