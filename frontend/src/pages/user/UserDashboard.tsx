import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  User as UserIcon,
  LogOut,
  Search,
  ChevronRight,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { services } from '../../data/mockData';
import { userApi } from '../../services/apiClient';

const UserDashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [isEditing, setIsEditing] = useState(false);
  const [searchService, setSearchService] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        const response = await userApi.getDashboard();
        
        // Maps backend Booking model to the mock format expected by JSX
        const mappedBookings = (response?.data?.data || []).map((b: any) => {
          const bDate = new Date(b.bookingDate);
          return {
            id: b._id,
            provider: b.provider?.user?.fullname || 'Provider',
            service: b.provider?.serviceType || 'Service',
            date: bDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            time: bDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: `₹${b.price || 0}`,
            status: mapApiStatusToUI(b.status)
          };
        });
        
        if (!cancelled) {
          setBookings(mappedBookings);
        }
      } catch {
        if (!cancelled) {
          setBookings([]);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapApiStatusToUI = (status: string) => {
    const s = status?.toLowerCase();
    if (['pending', 'awaiting_payment'].includes(s)) return 'Pending';
    if (s === 'accepted') return 'Accepted';
    if (['service_completed_by_provider', 'completed'].includes(s)) return 'Completed';
    if (['cancelled_by_user', 'rejected_by_provider'].includes(s)) return 'Cancelled';
    return 'Pending';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileData);
    setIsEditing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchService.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full py-12 px-8 md:px-16 container mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Hello, <span className="text-[#2563EB]">{user?.name}</span></h1>
          <p className="text-[#9CA3AF]">Manage your bookings and profile information.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 glass p-8 rounded-[25px] border border-white/5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold italic">What are you looking for today?</h2>
                <p className="text-xs text-[#4B5563] uppercase tracking-widest font-black">Quick search for your home needs</p>
              </div>
              <div className="flex w-full md:w-auto gap-4">
                <div className="relative flex-grow md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563]" size={18} />
                  <input
                    type="text"
                    placeholder="Search for a service..."
                    className="w-full h-12 bg-[#0F172A] border border-[#334155] pl-12 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => navigate('/services')}>Browse All</Button>
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredServices.slice(0, 8).map((service) => (
                <Card
                  key={service.id}
                  interactive
                  className="p-8 flex flex-col items-center text-center space-y-4 blue-glow-hover"
                  onClick={() => navigate(`/providers?service=${service.id}`)}
                >
                  <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center border border-white/5`}>
                    <div className={`${service.color} text-xs font-bold uppercase`}>ICON</div>
                  </div>
                  <h3 className="font-bold">{service.name}</h3>
                  <div className="pt-2">
                    <ChevronRight size={16} className="text-[#2563EB]" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card className="p-0 overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#111827] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Booking ID</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Professional</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Service</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Date/Time</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Amount</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px] text-[#4B5563]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-sm text-[#2563EB] font-bold">#{booking.id}</td>
                      <td className="px-8 py-6 text-sm font-bold text-white">{booking.provider}</td>
                      <td className="px-8 py-6 text-sm text-[#9CA3AF]">{booking.service}</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium">{booking.date}</div>
                        <div className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest">{booking.time}</div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-white">{booking.amount}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                          booking.status === 'Accepted' ? 'bg-blue-500/10 text-blue-500' :
                          booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                          {booking.status === 'Completed' && <CheckCircle2 size={10} />}
                          {booking.status === 'Accepted' && <Clock size={10} />}
                          {booking.status === 'Pending' && <Clock size={10} />}
                          {booking.status === 'Cancelled' && <XCircle size={10} />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/20"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bookings.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <p className="text-[#9CA3AF]">You haven't made any bookings yet.</p>
                <Button variant="outline" onClick={() => navigate('/services')}>Find a Service</Button>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto">
            <Card className="p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#2563EB] rounded-[20px] flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">{user?.name}</h3>
                    <p className="text-[#9CA3AF] text-sm">{user?.email}</p>
                  </div>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit3 size={16} />
                    Edit Profile
                  </Button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Full Name"
                    disabled={!isEditing}
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Phone Number"
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                  <Input
                    label="Location"
                    disabled={!isEditing}
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
                    <Button type="submit" className="px-10 font-bold">Save Changes</Button>
                    <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
