import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  ClipboardList, 
  IndianRupee, 
  User, 
  Bell,
  CalendarDays, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Navigation,
  CheckCircle, 
  XCircle, 
  Loader2, 
  Trophy, 
  MessageSquare, 
  ToggleLeft, 
  ToggleRight, 
  ChevronRight, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const mockProvider = {
  _id: "p1", 
  fullname: "Rajesh Kumar", 
  username: "rajeshk",
  email: "rajesh@example.com", 
  phone: "9876543210",
  address: "Powai, Mumbai", 
  role: "provider",
  serviceType: "electrician", 
  serviceArea: "Powai, Andheri, Vikhroli",
  rating: 4.6, 
  totalReviews: 18, 
  isApproved: true,
  memberSince: "January 2024", 
  earnings: 12450
};

const mockRequestsData = [
  { id:"r1", userName:"Ananya Mehta", userInitials:"AM",
    status:"pending", date:"2025-07-18", timeSlot:"Morning 9am",
    location:"Andheri West", price:199, note:"Fix bedroom switch" },
  { id:"r2", userName:"Rohan Patel", userInitials:"RP",
    status:"accepted", date:"2025-07-19", timeSlot:"Afternoon 1pm",
    location:"Powai", price:199, note:"" },
  { id:"r3", userName:"Sneha Iyer", userInitials:"SI",
    status:"completed", date:"2025-07-15", timeSlot:"Evening 5pm",
    location:"Vikhroli", price:350, note:"Full wiring checkup" },
  { id:"r4", userName:"Karan Shah", userInitials:"KS",
    status:"rejected", date:"2025-07-14", timeSlot:"Morning 9am",
    location:"Andheri East", price:199, note:"" },
  { id:"r5", userName:"Divya Nair", userInitials:"DN",
    status:"completed", date:"2025-07-10", timeSlot:"Afternoon 1pm",
    location:"Powai", price:299, note:"Fan installation" }
];

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Using mock data for UI development if user context isn't fully available
  const currentProvider = user?.role === 'provider' ? user : mockProvider;

  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState(mockRequestsData);
  const [activeFilter, setActiveFilter] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    if (!isAvailable) {
      toast.success("You are now available", {
        style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' },
      });
    } else {
      toast.error("You are now unavailable", {
        style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' },
      });
    }
  };

  const updateRequestStatus = (id, newStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));

    if (newStatus === 'accepted') toast.success("Request accepted!", { style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' }});
    if (newStatus === 'rejected') toast.error("Request rejected", { style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' }});
    if (newStatus === 'completed') toast.success("Marked as complete!", { style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' }});
  };

  const handleLogout = () => {
    toast.error("Logged out", { style: { background: '#111111', color: '#fff', border: '1px solid #2a2a2a' }});
    if (logout) logout();
    navigate('/');
  };

  const renderStatusBadge = (status) => {
    const config = {
      pending: "border-[#eab308] text-[#eab308]",
      accepted: "border-[#22c55e] text-[#22c55e]",
      completed: "border-[#3b82f6] text-[#3b82f6]",
      rejected: "border-[#ef4444] text-[#ef4444]"
    };
    return (
      <span className={`text-[12px] font-medium px-3 py-1 rounded-full border bg-transparent capitalize ${config[status]}`}>
        {status}
      </span>
    );
  };

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  const stats = {
    totalBookings: requests.length,
    pending: pendingRequests.length,
    completed: completedRequests.length,
    earnings: completedRequests.reduce((sum, req) => sum + req.price, 0)
  };

  const renderOverview = () => (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Greeting Banner */}
      <div>
        <h1 className="text-[28px] font-bold text-white mb-1">
          Good morning, {currentProvider.fullname.split(' ')[0]} 👋
        </h1>
        <p className="text-[#a3a3a3] text-[15px]">Here's your business at a glance</p>
      </div>

      {/* Availability Toggle */}
      <div 
        className={`bg-[#111111] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-all duration-300 ${
          isAvailable ? 'border-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#ef4444]/30'
        }`}
      >
        <div>
          <h2 className="text-white text-[18px] font-semibold mb-2">Availability Status</h2>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAvailable ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></span>
              {isAvailable ? 'Taking Requests' : 'Not Available'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleToggleAvailability}
          className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 focus:ring-offset-[#111111]"
        >
          <span className="sr-only">Toggle availability</span>
          <span
            className={`pointer-events-none absolute h-full w-full rounded-full transition-colors duration-200 ease-in-out ${
              isAvailable ? 'bg-[#22c55e]' : 'bg-[#333333]'
            }`}
          />
          <span
            className={`pointer-events-none absolute left-0 inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
              isAvailable ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#3b82f6]/50 transition-colors">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3b82f6]/30 group-hover:bg-[#3b82f6] transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
              <CalendarDays className="w-5 h-5 text-[#3b82f6]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-white leading-none mb-1">{stats.totalBookings}</div>
          <div className="text-[#a3a3a3] text-[14px]">Total Bookings</div>
        </div>

        {/* Pending */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#eab308]/50 transition-colors">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#eab308]/30 group-hover:bg-[#eab308] transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#eab308]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#eab308]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-white leading-none mb-1">{stats.pending}</div>
          <div className="text-[#a3a3a3] text-[14px]">Pending</div>
        </div>

        {/* Completed */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#22c55e]/50 transition-colors">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#22c55e]/30 group-hover:bg-[#22c55e] transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#22c55e]/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-white leading-none mb-1">{stats.completed}</div>
          <div className="text-[#a3a3a3] text-[14px]">Completed</div>
        </div>

        {/* Earnings */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 relative overflow-hidden group hover:border-[#F97316]/50 transition-colors">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F97316]/30 group-hover:bg-[#F97316] transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#F97316]/10 rounded-lg">
              <IndianRupee className="w-5 h-5 text-[#F97316]" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-white leading-none mb-1 flex items-center">
            <span className="text-[20px] mr-1 text-[#F97316]">₹</span>{stats.earnings}
          </div>
          <div className="text-[#a3a3a3] text-[14px]">Earnings</div>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-white flex items-center gap-2">
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="bg-[#F97316] text-white text-[12px] px-2 py-0.5 rounded-full font-bold">
                {pendingRequests.length}
              </span>
            )}
          </h2>
          <button 
            onClick={() => setActiveTab('requests')}
            className="text-[#F97316] text-[14px] hover:text-[#ea6c0a] transition-colors flex items-center"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-4">
          {pendingRequests.slice(0, 3).map(req => (
            <div key={req.id} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#F97316]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center text-white font-medium">
                    {req.userInitials}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{req.userName}</h3>
                    <div className="text-[#a3a3a3] text-[13px] flex items-center gap-2 mt-0.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {req.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#F97316] font-semibold">₹{req.price}</div>
                  <div className="text-[#a3a3a3] text-[12px]">{req.timeSlot}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[#a3a3a3] text-[13px] mb-4">
                <MapPin className="w-4 h-4 text-[#525252]" />
                {req.location}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => updateRequestStatus(req.id, 'accepted')}
                  className="flex-1 bg-transparent border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button 
                  onClick={() => updateRequestStatus(req.id, 'rejected')}
                  className="flex-1 bg-transparent border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 py-2 rounded-xl text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#525252]" />
              </div>
              <h3 className="text-white font-medium text-[16px] mb-1">All caught up!</h3>
              <p className="text-[#a3a3a3] text-[14px]">No pending requests at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6 pb-20 lg:pb-6">
      <h1 className="text-[28px] font-bold text-white mb-6">Service Requests</h1>
      
      {/* Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 auto-cols-max">
        {['all', 'pending', 'accepted', 'completed', 'rejected'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 shrink-0 ${
              activeFilter === filter 
                ? 'bg-[#F97316] text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'bg-[#111111] text-[#a3a3a3] border border-[#2a2a2a] hover:border-[#525252]'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#F97316]/30 transition-colors">
            {/* Top row */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white font-bold text-[16px]">
                  {req.userInitials}
                </div>
                <div>
                  <h3 className="text-white font-medium text-[16px]">{req.userName}</h3>
                  <div className="text-[#F97316] font-semibold text-[15px] flex items-center mt-0.5">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {req.price}
                  </div>
                </div>
              </div>
              <div>
                {renderStatusBadge(req.status)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-5 p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
              <div className="flex items-center gap-2.5 text-[#a3a3a3] text-[13px]">
                <CalendarDays className="w-4 h-4 text-[#525252]" />
                {req.date}
              </div>
              <div className="flex items-center gap-2.5 text-[#a3a3a3] text-[13px]">
                <Clock className="w-4 h-4 text-[#525252]" />
                {req.timeSlot}
              </div>
              <div className="flex items-center gap-2.5 text-[#a3a3a3] text-[13px] sm:col-span-2">
                <MapPin className="w-4 h-4 text-[#525252] shrink-0" />
                <span className="truncate">{req.location}</span>
              </div>
              {req.note && (
                <div className="flex items-start gap-2.5 text-[#a3a3a3] text-[13px] sm:col-span-2 mt-1">
                  <MessageSquare className="w-4 h-4 text-[#525252] shrink-0 mt-0.5" />
                  <span className="italic">"{req.note}"</span>
                </div>
              )}
            </div>

            {/* Actions based on status */}
            <div>
              {req.status === 'pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => updateRequestStatus(req.id, 'accepted')}
                    className="flex-1 bg-transparent border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 py-2.5 rounded-xl text-[14px] font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => updateRequestStatus(req.id, 'rejected')}
                    className="flex-1 bg-transparent border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 py-2.5 rounded-xl text-[14px] font-medium transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}

              {req.status === 'accepted' && (
                <div className="flex flex-col gap-3">
                  <div className="w-full text-center py-1 text-[13px] text-[#3b82f6] font-medium bg-[#3b82f6]/10 rounded-lg">
                    In Progress
                  </div>
                  <button 
                    onClick={() => updateRequestStatus(req.id, 'completed')}
                    className="w-full bg-[#F97316] text-white hover:bg-[#ea6c0a] py-2.5 rounded-xl text-[14px] font-medium transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  >
                    Mark as Complete
                  </button>
                </div>
              )}

              {req.status === 'completed' && (
                <div className="w-full text-center py-2.5 text-[14px] text-[#22c55e] font-medium border border-[#22c55e]/30 bg-[#22c55e]/5 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Completed ✓
                </div>
              )}

              {req.status === 'rejected' && (
                <div className="w-full text-center py-2.5 text-[14px] text-[#ef4444] font-medium border border-[#ef4444]/30 bg-[#ef4444]/5 rounded-xl flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Rejected
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-[#525252]" />
            </div>
            <h3 className="text-white font-medium text-[18px] mb-2">No {activeFilter !== 'all' ? activeFilter : ''} requests found</h3>
            <p className="text-[#a3a3a3] text-[14px]">
              {activeFilter === 'pending' ? "You're all caught up!" : "Change your filter to see more results."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6 pb-20 lg:pb-6">
      <h1 className="text-[28px] font-bold text-white mb-6">Earnings History</h1>
      
      {/* Summary Banner */}
      <div 
        className="rounded-2xl p-6 border border-[#F97316]/30 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(249,115,22,0.1) 0%, rgba(17,17,17,1) 100%)' }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-[#F97316] text-[14px] font-medium mb-1 uppercase tracking-wider">Total Earned</div>
            <div className="text-[48px] font-black text-white leading-none flex items-start tracking-tight">
              <span className="text-[28px] mt-1 mr-1 text-[#F97316]">₹</span>
              {stats.earnings.toLocaleString()}
            </div>
            <div className="text-[#a3a3a3] text-[14px] mt-2">All time earnings on ServiceSetu</div>
          </div>
          
          <div className="flex gap-6 pt-4 md:pt-0 border-t border-[#2a2a2a] md:border-t-0">
            <div>
              <div className="text-[#525252] text-[13px] mb-1">Completed Jobs</div>
              <div className="text-white text-[20px] font-bold">{stats.completed}</div>
            </div>
            <div>
              <div className="text-[#525252] text-[13px] mb-1">Avg. per Job</div>
              <div className="text-white text-[20px] font-bold">
                ₹{stats.completed > 0 ? Math.round(stats.earnings / stats.completed) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-[20px] font-semibold text-white mt-8 mb-4">Payout History</h2>
      
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        {completedRequests.length > 0 ? (
          <div className="divide-y divide-[#2a2a2a]">
            {completedRequests.map(job => (
              <div key={job.id} className="p-5 flex justify-between items-center hover:bg-[#141414] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#F97316]">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-[15px]">{job.userName}</div>
                    <div className="text-[#525252] text-[13px]">{job.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#F97316] font-bold text-[16px]">₹{job.price}</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-[11px] font-medium mt-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Trophy className="w-12 h-12 text-[#2a2a2a] mx-auto mb-3" />
            <h3 className="text-white font-medium text-[16px] mb-1">No completed services yet</h3>
            <p className="text-[#525252] text-[14px]">Complete your first job to see earnings here.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 pb-20 lg:pb-6 max-w-2xl mx-auto">
      <h1 className="text-[28px] font-bold text-white mb-6">Provider Profile</h1>

      {/* Profile Header */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#F97316]/10 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="w-[88px] h-[88px] rounded-full bg-[#F97316] flex items-center justify-center text-white text-[32px] font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] border-4 border-[#111111] mb-4 mx-auto">
            {currentProvider.fullname.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-[24px] font-bold text-white mb-1">{currentProvider.fullname}</h2>
          <p className="text-[#a3a3a3] text-[15px] mb-4">@{currentProvider.username}</p>
          
          {currentProvider.isApproved ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#22c55e]/50 bg-[#22c55e]/10 text-[#22c55e] text-[13px] font-medium">
              <CheckCircle className="w-4 h-4" /> Verified Provider
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#eab308]/50 bg-[#eab308]/10 text-[#eab308] text-[13px] font-medium">
              <Clock className="w-4 h-4" /> Under Review - 24hr
            </div>
          )}
        </div>
      </div>

      {/* Rating Card */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 flex items-center justify-center gap-6">
        <div className="text-[48px] font-black text-white leading-none">{currentProvider.rating}</div>
        <div>
          <div className="flex text-[#F97316] mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`w-5 h-5 ${star <= Math.floor(currentProvider.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <div className="text-[#a3a3a3] text-[14px]">Based on {currentProvider.totalReviews} reviews</div>
        </div>
      </div>

      {/* Info List */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-4">
          <Phone className="w-5 h-5 text-[#525252]" />
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Phone Number</div>
            <div className="text-white text-[14px]">{currentProvider.phone}</div>
          </div>
        </div>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-4">
          <Mail className="w-5 h-5 text-[#525252]" />
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Email Address</div>
            <div className="text-white text-[14px]">{currentProvider.email}</div>
          </div>
        </div>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-4">
          <MapPin className="w-5 h-5 text-[#525252]" />
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Primary Address</div>
            <div className="text-white text-[14px]">{currentProvider.address}</div>
          </div>
        </div>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-4">
          <div className="w-5 h-5 rounded-full bg-[#F97316]/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div>
          </div>
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Service Type</div>
            <div className="inline-block mt-0.5 px-2.5 py-0.5 bg-[#F97316]/10 text-[#F97316] rounded border border-[#F97316]/20 text-[12px] capitalize font-medium">
              {currentProvider.serviceType}
            </div>
          </div>
        </div>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-4">
          <Navigation className="w-5 h-5 text-[#525252]" />
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Service Areas</div>
            <div className="text-white text-[14px]">{currentProvider.serviceArea}</div>
          </div>
        </div>
        <div className="p-5 flex items-center gap-4">
          <CalendarDays className="w-5 h-5 text-[#525252]" />
          <div>
            <div className="text-[12px] text-[#525252] mb-0.5">Member Since</div>
            <div className="text-white text-[14px]">{currentProvider.memberSince}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button className="w-full py-3.5 rounded-xl border border-[#2a2a2a] text-white font-medium hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">
          Edit Profile
        </button>
        <button className="w-full py-3.5 rounded-xl border border-[#2a2a2a] text-white font-medium hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">
          Change Password
        </button>
        <button 
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-[#ef4444] text-[#ef4444] font-medium hover:bg-[#ef4444]/10 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      tabs={tabs}
      role="provider"
    >
      <div className="animate-in fade-in duration-300">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'earnings' && renderEarnings()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
