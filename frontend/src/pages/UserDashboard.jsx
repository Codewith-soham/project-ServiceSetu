import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Home, 
  ClipboardList, 
  Bell, 
  User, 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  Edit, 
  Lock, 
  LogOut, 
  ClipboardX
} from 'lucide-react';

const mockBookingsData = [
  {
    id: "1",
    providerName: "Sunita Sharma",
    serviceType: "maid",
    date: "2025-03-20",
    time: "Morning 9am",
    note: "Please bring cleaning supplies",
    price: 299,
    status: "pending"
  },
  {
    id: "2", 
    providerName: "Rajesh Kumar",
    serviceType: "electrician",
    date: "2025-03-18",
    time: "Afternoon 1pm",
    note: "",
    price: 199,
    status: "accepted"
  },
  {
    id: "3",
    providerName: "Mohammed Ansari",
    serviceType: "plumber",
    date: "2025-03-15",
    time: "Evening 5pm",
    note: "Leaking pipe in bathroom",
    price: 249,
    status: "completed"
  },
  {
    id: "4",
    providerName: "Geeta Devi",
    serviceType: "caretaker",
    date: "2025-03-10",
    time: "Morning 9am",
    note: "",
    price: 499,
    status: "cancelled"
  }
];

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: "Booking Accepted! ✅",
    message: "Rajesh Kumar accepted your electrician booking for March 18th",
    time: "2 hours ago"
  },
  {
    id: 2,
    type: 'info',
    title: "Booking Reminder 📅",
    message: "Your maid service with Sunita Sharma is tomorrow at 9am",
    time: "1 day ago"
  },
  {
    id: 3,
    type: 'warning',
    title: "Welcome to ServiceSetu! 🎉",
    message: "Complete your profile to get personalized service recommendations",
    time: "3 days ago"
  }
];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState(mockBookingsData);
  const [activeFilter, setActiveFilter] = useState('all');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const cancelBooking = (id) => {
    setBookings(prev => prev.map(b => 
      b.id === id ? {...b, status: 'cancelled'} : b
    ));
    toast.success("Booking cancelled");
  };

  const filteredBookings = activeFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeFilter);

  const renderHome = () => (
    <div>
      <h1 className="hidden lg:block text-[24px] font-bold text-white mb-6">
        Welcome back, {user?.fullname || 'User'} 👋
      </h1>

      <div className="lg:hidden bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#2a2a2a] rounded-[16px] p-5 mb-5">
        <h2 className="text-[18px] font-semibold text-white mb-1">
          Good morning, {user?.fullname || 'User'} 👋
        </h2>
        <p className="text-[#525252] text-[14px]">What service do you need today?</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F97316]"></div>
          <div className="text-[28px] font-bold text-white leading-none mt-1">4</div>
          <div className="text-[12px] text-[#525252] mt-1">Total</div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#eab308]"></div>
          <div className="text-[28px] font-bold text-[#eab308] leading-none mt-1">1</div>
          <div className="text-[12px] text-[#525252] mt-1">Pending</div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#22c55e]"></div>
          <div className="text-[28px] font-bold text-[#22c55e] leading-none mt-1">2</div>
          <div className="text-[12px] text-[#525252] mt-1">Completed</div>
        </div>
      </div>

      <h3 className="text-[16px] font-semibold text-white mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div 
          onClick={() => navigate('/home')}
          className="bg-gradient-to-br from-[#F97316]/15 to-[#F97316]/5 border border-[#F97316]/30 rounded-[14px] p-[18px] cursor-pointer hover:border-orange-500 transition-all duration-200 active:scale-95"
        >
          <Search className="w-[28px] h-[28px] text-[#F97316] mb-2" />
          <div className="text-[14px] font-semibold text-white mb-1">Book a Service</div>
          <div className="text-[12px] text-[#525252]">Find providers nearby</div>
        </div>
        <div 
          className="bg-gradient-to-br from-[#3b82f6]/15 to-[#3b82f6]/5 border border-[#3b82f6]/30 rounded-[14px] p-[18px] cursor-pointer hover:border-blue-500 transition-all duration-200 active:scale-95"
        >
          <Users className="w-[28px] h-[28px] text-[#3b82f6] mb-2" />
          <div className="text-[14px] font-semibold text-white mb-1">Browse Providers</div>
          <div className="text-[12px] text-[#525252]">See all available providers</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[16px] font-semibold text-white">Recent Bookings</h3>
        <span 
          onClick={() => setActiveTab('bookings')}
          className="text-[13px] text-[#F97316] cursor-pointer hover:underline"
        >
          View all &rarr;
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {bookings.slice(0, 3).map(booking => (
          <div key={booking.id} className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-[14px_16px] flex justify-between items-center">
            <div>
              <div className="text-[14px] font-semibold text-white mb-1">{booking.providerName}</div>
              <div className="text-[12px] text-[#525252] flex items-center gap-2 capitalize">
                {booking.serviceType} <span className="w-1 h-1 rounded-full bg-[#525252]"></span> {booking.date}
              </div>
            </div>
            {renderStatusBadge(booking.status)}
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="text-center p-[40px_20px]">
            <ClipboardX className="w-[40px] h-[40px] text-[#2a2a2a] mx-auto mb-3" />
            <div className="text-[16px] font-semibold text-[#a3a3a3] mb-2">No bookings yet</div>
            <div className="text-[13px] text-[#525252] mb-4">Book your first service to get started</div>
            <button 
              onClick={() => navigate('/home')}
              className="bg-[#F97316] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Book a Service &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatusBadge = (status) => {
    const config = {
      pending: "bg-[#eab308]/10 border-[#eab308]/30 text-[#eab308]",
      accepted: "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]",
      completed: "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]",
      cancelled: "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
    };
    return (
      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border capitalize ${config[status]}`}>
        {status}
      </span>
    );
  };

  const renderBookings = () => (
    <div>
      <h1 className="text-[22px] font-bold text-white mb-4">My Bookings</h1>
      
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1 touch-pan-x">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap text-[13px] px-4 py-2 rounded-full font-medium transition-colors ${
              activeFilter === filter 
                ? 'bg-[#F97316] text-white'
                : 'bg-[#111111] text-[#525252] border border-[#2a2a2a] hover:border-[#F97316] hover:text-white'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-[#111111] border border-[#2a2a2a] rounded-[14px] overflow-hidden relative">
            <div className={`w-1 h-full absolute left-0 top-0 ${
              booking.status === 'pending' ? 'bg-[#eab308]' :
              booking.status === 'accepted' ? 'bg-[#22c55e]' :
              booking.status === 'completed' ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'
            }`}></div>
            
            <div className="p-[16px_16px_16px_20px]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[15px] font-semibold text-white mb-1">{booking.providerName}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${
                    booking.serviceType === 'maid' ? 'bg-[#F97316]/10 text-[#F97316]' :
                    booking.serviceType === 'electrician' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                    booking.serviceType === 'plumber' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                    'bg-[#a855f7]/10 text-[#a855f7]'
                  }`}>
                    {booking.serviceType}
                  </span>
                </div>
                {renderStatusBadge(booking.status)}
              </div>

              <div className="flex gap-4 mt-2 mb-3">
                <div className="flex items-center gap-1.5 text-[#525252]">
                  <Calendar className="w-[14px] h-[14px]" />
                  <span className="text-[13px] text-[#a3a3a3]">{booking.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#525252]">
                  <Clock className="w-[14px] h-[14px]" />
                  <span className="text-[13px] text-[#a3a3a3]">{booking.time}</span>
                </div>
              </div>

              {booking.note && (
                <div className="bg-[#0a0a0a] rounded-[8px] p-[8px_12px] mb-3 flex items-start gap-1.5">
                  <MessageSquare className="w-[12px] h-[12px] text-[#525252] mt-[3px] shrink-0" />
                  <span className="text-[12px] text-[#525252] italic">{booking.note}</span>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                <div className="text-[16px] font-bold text-[#F97316]">₹{booking.price}</div>
                
                {booking.status === 'pending' && (
                  <button 
                    onClick={() => cancelBooking(booking.id)}
                    className="border border-[#ef4444]/30 text-[#ef4444] bg-transparent px-4 py-1.5 rounded-lg text-sm hover:bg-[#ef4444]/10 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {booking.status === 'accepted' && (
                  <div className="flex items-center gap-1 text-[#22c55e] text-[13px] font-medium">
                    <CheckCircle className="w-[14px] h-[14px]" />
                    Accepted
                  </div>
                )}
                {booking.status === 'completed' && (
                  <button className="border border-[#F97316]/30 text-[#F97316] bg-transparent px-4 py-1.5 rounded-lg text-sm hover:bg-[#F97316]/10 transition-colors">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredBookings.length === 0 && (
          <div className="text-center p-[40px_20px]">
            <ClipboardList className="w-[40px] h-[40px] text-[#2a2a2a] mx-auto mb-3" />
            <div className="text-[16px] font-semibold text-[#a3a3a3] mb-2">No bookings found</div>
            <div className="text-[13px] text-[#525252]">Try changing your filters</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <h1 className="text-[22px] font-bold text-white mb-4">Notifications</h1>
      
      <div className="flex flex-col gap-3">
        {mockNotifications.map(notification => (
          <div key={notification.id} className="bg-[#111111] border border-[#2a2a2a] rounded-[12px] p-[14px_16px] flex gap-3 items-start">
            <div className={`mt-1.5 w-[10px] h-[10px] rounded-full shrink-0 ${
              notification.type === 'success' ? 'bg-[#22c55e]' :
              notification.type === 'info' ? 'bg-[#3b82f6]' : 'bg-[#eab308]'
            }`}></div>
            <div>
              <div className="text-[14px] font-semibold text-white mb-0.5">{notification.title}</div>
              <div className="text-[13px] text-[#a3a3a3] leading-relaxed">{notification.message}</div>
              <div className="text-[12px] text-[#525252] mt-1">{notification.time}</div>
            </div>
          </div>
        ))}
        {mockNotifications.length === 0 && (
          <div className="text-center p-[40px_20px]">
            <Bell className="w-[40px] h-[40px] text-[#2a2a2a] mx-auto mb-3" />
            <div className="text-[16px] font-semibold text-[#a3a3a3] mb-2">No notifications yet</div>
            <div className="text-[13px] text-[#525252]">You're all caught up!</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div>
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#2a2a2a] rounded-[16px] p-6 mb-4 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-[#F97316]/20 border-2 border-[#F97316]/40 mx-auto mb-3 flex items-center justify-center text-[28px] font-bold text-[#F97316]">
          {user?.fullname ? user.fullname.substring(0,2).toUpperCase() : 'US'}
        </div>
        <h2 className="text-[20px] font-bold text-white mb-1">{user?.fullname || 'Test User'}</h2>
        <div className="inline-flex items-center bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-[12px] px-3 py-1 rounded-full font-medium">
          Customer
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2a2a2a] rounded-[14px] overflow-hidden mb-4">
        <div className="p-[14px_16px] border-b border-[#2a2a2a]">
          <h3 className="text-[14px] font-semibold text-white">Personal Information</h3>
        </div>
        <div className="flex justify-between items-center p-[14px_16px] border-b border-[#1a1a1a]">
          <span className="text-[13px] text-[#525252]">Full Name</span>
          <span className="text-[14px] text-white font-medium">{user?.fullname || 'Test User'}</span>
        </div>
        <div className="flex justify-between items-center p-[14px_16px] border-b border-[#1a1a1a]">
          <span className="text-[13px] text-[#525252]">Email</span>
          <span className="text-[14px] text-[#a3a3a3]">{user?.email || 'user@example.com'}</span>
        </div>
        <div className="flex justify-between items-center p-[14px_16px] border-b border-[#1a1a1a]">
          <span className="text-[13px] text-[#525252]">Phone</span>
          <span className="text-[14px] text-[#a3a3a3]">{user?.phone || '+91 9876543210'}</span>
        </div>
        <div className="flex justify-between items-center p-[14px_16px] border-b border-[#1a1a1a]">
          <span className="text-[13px] text-[#525252]">Address</span>
          <span className="text-[14px] text-[#a3a3a3] truncate max-w-[150px]">{user?.address || 'Mumbai, India'}</span>
        </div>
        <div className="flex justify-between items-center p-[14px_16px]">
          <span className="text-[13px] text-[#525252]">Member Since</span>
          <span className="text-[14px] text-[#a3a3a3]">March 2025</span>
        </div>
      </div>

      <button className="w-full bg-[#111111] border border-[#2a2a2a] text-[#a3a3a3] rounded-[12px] p-[13px] text-[14px] font-medium hover:border-[#F97316] hover:text-white flex items-center justify-center gap-2 mb-3 transition-colors">
        <Edit className="w-[16px] h-[16px]" />
        Edit Profile
      </button>

      <button className="w-full bg-[#111111] border border-[#2a2a2a] text-[#a3a3a3] rounded-[12px] p-[13px] text-[14px] font-medium hover:border-[#F97316] hover:text-white flex items-center justify-center gap-2 mb-3 transition-colors">
        <Lock className="w-[16px] h-[16px]" />
        Change Password
      </button>

      <button 
        onClick={() => {
          if (logout) logout();
          navigate('/');
        }}
        className="w-full bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#ef4444] rounded-[12px] p-[13px] text-[14px] font-medium hover:bg-[#ef4444]/10 flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-[16px] h-[16px]" />
        Logout
      </button>

      <div className="text-center text-[#2a2a2a] text-[12px] mt-4 mb-2">
        ServiceSetu v1.0.0 • Made with ❤️ in India
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      tabs={tabs}
      role="user"
    >
      <div className="animate-in fade-in duration-300">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
