import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  BadgeIndianRupee,
  ClipboardList,
  MapPin,
  Phone
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { providerApi, bookingApi } from '../../services/apiClient';
import { createAuthenticatedSocket, SOCKET_EVENTS } from '../../services/socketClient';

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>({
    totalProviderEarnings: 0,
    totalPlatformCommission: 0,
    totalGatewayFees: 0,
    totalBookings: 0,
  });
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const [payoutForm, setPayoutForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
    preferredMethod: 'bank',
  });
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const formatBookingDate = (value: string | Date) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Invalid date';
    return parsedDate.toLocaleDateString();
  };

  const formatBookingTime = (value: string | Date) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Invalid time';
    return parsedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      if (isMountedRef.current) setIsLoading(true);
      const [bookingResponse, earningsResponse] = await Promise.all([
        providerApi.getProviderBookings(),
        providerApi.getProviderEarnings(),
      ]);
      if (!isMountedRef.current) return;
      const bookingList = Array.isArray(bookingResponse?.data)
        ? bookingResponse.data
        : Array.isArray(bookingResponse?.data?.data)
          ? bookingResponse.data.data
          : [];
      setBookings(bookingList);

      const earningsPayload = earningsResponse?.data?.totals || earningsResponse?.data || {};
      setEarnings({
        totalProviderEarnings: Number(earningsPayload.totalProviderEarnings || 0),
        totalPlatformCommission: Number(earningsPayload.totalPlatformCommission || 0),
        totalGatewayFees: Number(earningsPayload.totalGatewayFees || 0),
        totalBookings: Number(earningsPayload.totalBookings || 0),
      });
    } catch {
      if (!isMountedRef.current) return;
      setBookings([]);
      setEarnings({
        totalProviderEarnings: 0,
        totalPlatformCommission: 0,
        totalGatewayFees: 0,
        totalBookings: 0,
      });
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  const fetchPayoutDetails = useCallback(async () => {
    try {
      const response = await providerApi.getPayoutDetails();
      const nextPayout = response?.data?.payoutDetails || null;
      if (!isMountedRef.current) return;
      setPayoutDetails(nextPayout);
      setPayoutForm({
        accountHolderName: nextPayout?.accountHolderName || '',
        accountNumber: '',
        ifscCode: nextPayout?.ifscCode || '',
        bankName: nextPayout?.bankName || '',
        upiId: nextPayout?.upiId || '',
        preferredMethod: nextPayout?.preferredMethod || 'bank',
      });
    } catch {
      if (!isMountedRef.current) return;
      setPayoutDetails(null);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchPayoutDetails();
  }, [fetchBookings, fetchPayoutDetails]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const socket = createAuthenticatedSocket();
    const handleBookingUpdated = (payload: any) => {
      console.log('[provider-dashboard] Booking updated via socket:', payload);
      fetchBookings();
    };
    const handleSocketError = () => {
      console.warn('[provider-dashboard] socket connect error; using polling fallback');
    };

    const pollingTimer = window.setInterval(() => {
      console.log('[provider-dashboard] Polling for booking updates...');
      fetchBookings();
    }, 15000);

    socket.on(SOCKET_EVENTS.BOOKING_UPDATED, handleBookingUpdated);
    socket.on('connect_error', handleSocketError);
    socket.connect();
    console.log('[provider-dashboard] Socket connected and listening for events');

    return () => {
      socket.off(SOCKET_EVENTS.BOOKING_UPDATED, handleBookingUpdated);
      socket.off('connect_error', handleSocketError);
      socket.disconnect();
      window.clearInterval(pollingTimer);
    };
  }, [user?.id, fetchBookings]);

  const handlePayoutSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setPayoutSaving(true);
      setPayoutMessage(null);
      const response = await providerApi.updatePayoutDetails({
        ...payoutForm,
        accountNumber: payoutForm.accountNumber,
      });
      const nextPayout = response?.data?.payoutDetails || null;
      setPayoutDetails(nextPayout);
      setPayoutForm((current) => ({
        ...current,
        accountNumber: '',
      }));
      setPayoutMessage('Payout details saved successfully.');
    } catch (err: any) {
      setPayoutMessage(err?.message || 'Failed to save payout details');
    } finally {
      setPayoutSaving(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    try {
      if (action === 'accept') await bookingApi.acceptBooking(id);
      else if (action === 'reject') await bookingApi.rejectBooking(id);
      else if (action === 'complete') await bookingApi.completeBooking(id);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} booking`);
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'accepted');
  const completedHistory = bookings.filter(
    b => b.status === 'completed' || b.status === 'service_completed_by_provider'
  );
  const activeTab = searchParams.get('tab') || 'dashboard';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-12 px-8 md:px-16 container mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Hello, <span className="text-[#2563EB]">{user?.name}</span></h1>
        <p className="text-[#9CA3AF]">Manage your service requests and view your earnings.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 border border-white/5 bg-[#111827]">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">Total Earnings</p>
          <p className="text-2xl font-black text-green-500 mt-2">₹{earnings.totalProviderEarnings.toFixed(2)}</p>
        </Card>
        <Card className="p-5 border border-white/5 bg-[#111827]">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">Completed Jobs</p>
          <p className="text-2xl font-black text-white mt-2">{earnings.totalBookings}</p>
        </Card>
      </section>

      {activeTab === 'dashboard' && (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-[#9CA3AF]" size={24} />
          <h2 className="text-xl font-bold">Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-white/5 bg-[#111827]">
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Pending Requests</p>
            <p className="text-3xl font-black text-yellow-500 mt-2">{pendingRequests.length}</p>
          </Card>
          <Card className="p-6 border border-white/5 bg-[#111827]">
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Active Bookings</p>
            <p className="text-3xl font-black text-blue-500 mt-2">{activeBookings.length}</p>
          </Card>
          <Card className="p-6 border border-white/5 bg-[#111827]">
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Completed Jobs</p>
            <p className="text-3xl font-black text-green-500 mt-2">{completedHistory.length}</p>
          </Card>
        </div>
      </section>
      )}

      {activeTab === 'bookings' && (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-500" size={24} />
          <h2 className="text-xl font-bold">Pending Requests ({pendingRequests.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.map((booking) => (
            <Card key={booking._id} className="p-6 space-y-4 border border-white/5 bg-[#111827]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{booking.user?.fullname || booking.userId?.fullname || 'Customer'}</p>
                  <p className="text-xs text-[#9CA3AF]">{booking.user?.email || booking.userId?.email || 'No email'}</p>
                </div>
                <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Pending
                </span>
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Phone size={14} />
                  <span>{booking.user?.phone || booking.userId?.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <ClipboardList size={14} />
                  <span>{booking.provider?.serviceType || booking.providerId?.serviceType || 'Service'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Calendar size={14} />
                  <span>{formatBookingDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Clock size={14} />
                  <span>{formatBookingTime(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <BadgeIndianRupee size={14} />
                  <span>Base: ₹{booking.price} | Earnings: <span className="text-green-500 font-bold">₹{Number(booking.providerAmount || 0).toFixed(2)}</span></span>
                </div>
              </div>

              {(booking.serviceAddress || booking.address || booking.user?.address) && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9CA3AF]">
                    <MapPin size={14} className="text-[#2563EB]" />
                    Service address
                  </div>
                  <p className="mt-2 text-sm text-white/90 leading-relaxed">
                    {booking.serviceAddress || booking.address || booking.user?.address}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-xs font-bold"
                  onClick={() => handleAction(booking._id, 'accept')}
                >
                  Accept
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 h-10 text-xs font-bold"
                  onClick={() => handleAction(booking._id, 'reject')}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-[#4B5563] text-sm italic">No pending requests at the moment.</p>
          )}
        </div>
      </section>
      )}

      {activeTab === 'bookings' && (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-blue-500" size={24} />
          <h2 className="text-xl font-bold">Active Bookings ({activeBookings.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBookings.map((booking) => (
            <Card key={booking._id} className="p-6 space-y-4 border border-white/5 bg-[#111827]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{booking.user?.fullname || booking.userId?.fullname || 'Customer'}</p>
                  <span className="text-xs text-[#9CA3AF]">{booking.provider?.serviceType || booking.providerId?.serviceType || 'Service'}</span>
                </div>
                <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Accepted
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Phone size={14} />
                <span>{booking.user?.phone || booking.userId?.phone || 'No phone'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Calendar size={14} />
                <span>Scheduled for: {formatBookingDate(booking.bookingDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <Clock size={14} />
                <span>Time: {formatBookingTime(booking.bookingDate)}</span>
              </div>

              {(booking.serviceAddress || booking.address || booking.user?.address) && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9CA3AF]">
                    <MapPin size={14} className="text-[#2563EB]" />
                    Service address
                  </div>
                  <p className="mt-2 text-sm text-white/90 leading-relaxed">
                    {booking.serviceAddress || booking.address || booking.user?.address}
                  </p>
                </div>
              )}

              <Button 
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] h-11 text-sm font-bold mt-2"
                onClick={() => handleAction(booking._id, 'complete')}
              >
                Mark Complete
              </Button>
            </Card>
          ))}
          {activeBookings.length === 0 && (
            <p className="text-[#4B5563] text-sm italic">No active bookings currently.</p>
          )}
        </div>
      </section>
      )}

      {activeTab === 'earnings' && (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-[#9CA3AF]" size={24} />
          <h2 className="text-xl font-bold">Completed History ({completedHistory.length})</h2>
        </div>
        <div className="glass rounded-[25px] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#111827]/50 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Service</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Date</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Earnings</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {completedHistory.map((booking) => (
                  <tr key={booking._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-white">{booking.provider?.serviceType || booking.providerId?.serviceType || 'Service'}</td>
                    <td className="px-8 py-6 text-sm text-[#9CA3AF] font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-sm font-black text-green-500">₹{Number(booking.providerAmount || 0).toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-500">
                        <CheckCircle2 size={10} /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {completedHistory.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#4B5563] text-sm">No completed bookings found.</p>
            </div>
          )}
        </div>
      </section>
      )}

      {activeTab === 'payouts' && (
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">Payout Settings</h2>
            <p className="text-sm text-[#9CA3AF]">Add the bank account or UPI where payouts should be sent.</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-full bg-white/5 text-[#9CA3AF] border border-white/10">
            {payoutDetails?.isVerified ? 'Verified' : 'Not verified'}
          </span>
        </div>

        <Card className="p-6 md:p-8 border border-white/5 bg-[#111827] space-y-6">
          {payoutMessage && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#F9FAFB]">
              {payoutMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Saved Account</p>
              <p className="font-semibold text-white mt-1">{payoutDetails?.accountHolderName || 'Not set'}</p>
              <p className="text-[#9CA3AF] mt-1">{payoutDetails?.accountNumber || 'No account saved'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Preferred Method</p>
              <p className="font-semibold text-white mt-1 capitalize">{payoutDetails?.preferredMethod || 'bank'}</p>
              <p className="text-[#9CA3AF] mt-1">{payoutDetails?.upiId || 'No UPI saved'}</p>
            </div>
          </div>

          <form onSubmit={handlePayoutSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account Holder Name"
                value={payoutForm.accountHolderName}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                placeholder="Enter account holder name"
                required
              />
              <Input
                label="Account Number"
                value={payoutForm.accountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                placeholder={payoutDetails?.accountNumber ? 'Enter new account number to replace saved one' : 'Enter account number'}
                required
              />
              <Input
                label="IFSC Code"
                value={payoutForm.ifscCode}
                onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value.toUpperCase() })}
                placeholder="ABCD0123456"
                required
              />
              <Input
                label="Bank Name"
                value={payoutForm.bankName}
                onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                placeholder="Enter bank name"
                required
              />
              <Input
                label="UPI ID"
                value={payoutForm.upiId}
                onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                placeholder="name@bank"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#9CA3AF]">Preferred Payout Method</label>
                <select
                  value={payoutForm.preferredMethod}
                  onChange={(e) => setPayoutForm({ ...payoutForm, preferredMethod: e.target.value })}
                  className="w-full rounded-[10px] border border-[#334155] bg-[#0F172A] px-3 h-12 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={payoutSaving}>
              {payoutSaving ? 'Saving...' : 'Save Payout Details'}
            </Button>
          </form>
        </Card>
      </section>
      )}
    </div>
  );
};

export default ProviderDashboard;
