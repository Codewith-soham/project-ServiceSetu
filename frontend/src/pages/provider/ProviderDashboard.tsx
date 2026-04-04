import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  BookOpen, 
  Wallet, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star, 
  ChevronRight, 
  Check,
  DollarSign,
  Users,
  CalendarCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { providerBookings } from '../../data/mockData';

const earningsData = [
  { name: 'Jan', earnings: 1200 },
  { name: 'Feb', earnings: 1800 },
  { name: 'Mar', earnings: 1600 },
  { name: 'Apr', earnings: 2400 },
  { name: 'May', earnings: 2100 },
  { name: 'Jun', earnings: 2800 },
];

const monthlyBreakdown = [
  { name: 'Jan', services: 8, revenue: 1200, tips: 120 },
  { name: 'Feb', services: 12, revenue: 1800, tips: 180 },
  { name: 'Mar', services: 11, revenue: 1600, tips: 140 },
  { name: 'Apr', services: 16, revenue: 2400, tips: 260 },
  { name: 'May', services: 14, revenue: 2100, tips: 210 },
  { name: 'Jun', services: 18, revenue: 2800, tips: 320 },
];

const ProviderDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [bookings, setBookings] = useState(providerBookings);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const totalEarnings = earningsData.reduce((sum, d) => sum + d.earnings, 0);

  const stats = [
    { label: 'Total Bookings', value: '48', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: Wallet, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Average Rating', value: '4.9', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Pending Requests', value: '3', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in py-12 px-8 md:px-16 container mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Provider <span className="text-purple-500">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your professional business and earnings.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-8 flex flex-col space-y-6 glass-dark blue-glow-hover">
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center border border-white/5`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                  </div>
                </Card>
              ))}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Earnings Chart */}
              <Card className="lg:col-span-2 p-10 space-y-10 h-[500px]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Earnings Overview</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-green-500 uppercase tracking-widest">
                    <TrendingUp size={16} />
                    +24% from last month
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#4B5563" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#4B5563" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#7C3AED', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#7C3AED" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorEarnings)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-10 space-y-8 glass shadow-2xl">
                <h3 className="text-xl font-bold border-b pb-4" style={{ color: 'var(--text-primary)', borderColor: 'var(--glass-border)' }}>Recent Feedback</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold" style={{ color: 'var(--text-primary)' }}>J</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>John Doe</span>
                          <span className="flex items-center text-xs text-yellow-500 font-bold">
                            <Star size={10} className="fill-yellow-500" />
                            5.0
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>"Amazing service, Alex was punctual and professional!"</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="full" className="rounded-xl font-bold">View All Reviews</Button>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card className="p-0 overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)' }}>
                  <tr>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>Booking ID</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>User</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>Package</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>Date/Time</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>Amount</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[3px]" style={{ color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-sm text-purple-500 font-bold">#{booking.id}</td>
                      <td className="px-8 py-6 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{booking.user}</td>
                      <td className="px-8 py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>{booking.service}</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{booking.date}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{booking.time}</div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black" style={{ color: 'var(--text-primary)' }}>{booking.amount}</td>
                      <td className="px-8 py-6">
                        <div className="flex gap-3">
                          {booking.status === 'Pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-9 px-4 text-xs font-bold gap-2"
                                onClick={() => handleStatusUpdate(booking.id, 'Accepted')}
                              >
                                <Check size={14} /> Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-9 px-4 text-xs font-bold gap-2 border-red-900/30"
                                onClick={() => handleStatusUpdate(booking.id, 'Rejected')}
                              >
                                <XCircle size={14} /> Reject
                              </Button>
                            </>
                          )}
                          {booking.status === 'Accepted' && (
                            <Button 
                              size="sm" 
                              className="bg-[#2563EB] hover:bg-[#3B82F6] h-9 px-4 text-xs font-bold gap-2"
                              onClick={() => handleStatusUpdate(booking.id, 'Completed')}
                            >
                              <CheckCircle2 size={14} /> Complete Service
                            </Button>
                          )}
                          {booking.status === 'Completed' && (
                            <span className="flex items-center gap-2 text-green-500 text-xs font-black uppercase tracking-widest bg-green-500/10 px-4 py-2 rounded-lg">
                              <CheckCircle2 size={14} /> Completed
                            </span>
                          )}
                          {booking.status === 'Rejected' && (
                            <span className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-lg">
                              <XCircle size={14} /> Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-10">
            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="p-8 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -z-10" />
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-white/5">
                  <DollarSign className="text-green-500" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>Total Earnings</p>
                  <h2 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>${totalEarnings.toLocaleString()}</h2>
                  <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                    <TrendingUp size={14} />
                    +24% from last period
                  </div>
                </div>
              </Card>

              <Card className="p-8 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10" />
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-white/5">
                  <CalendarCheck className="text-blue-500" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>Completed Jobs</p>
                  <h2 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>79</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Across 6 months</p>
                </div>
              </Card>

              <Card className="p-8 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -z-10" />
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-white/5">
                  <Users className="text-purple-500" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest font-black" style={{ color: 'var(--text-muted)' }}>Avg per Service</p>
                  <h2 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>${Math.round(totalEarnings / 79)}</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Per completed job</p>
                </div>
              </Card>
            </div>

            {/* Earnings Graph — Full Width */}
            <Card className="p-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Earnings Trend</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Monthly revenue and tips breakdown</p>
                </div>
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Revenue</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Tips</span>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBreakdown} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4B5563" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#4B5563" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F9FAFB' }}
                      formatter={(value: number, name: string) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Tips']}
                    />
                    <Bar dataKey="revenue" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="tips" fill="#22C55E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Cumulative Growth Line */}
            <Card className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Cumulative Growth</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Total earnings over time</p>
                </div>
                <div className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} />
                  Steady Growth
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData.map((d, i, arr) => ({
                    ...d,
                    cumulative: arr.slice(0, i + 1).reduce((s, x) => s + x.earnings, 0)
                  }))}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4B5563" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#4B5563" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Earnings']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#2563EB" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorCumulative)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="p-10 space-y-10">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
              <div className="space-y-6">
                {[
                  { id: 'T2001', type: 'Credit', desc: 'Service Completion #B1002', date: 'Mar 25, 2024', amount: '+$60.00', status: 'Success' },
                  { id: 'T2002', type: 'Credit', desc: 'Service Completion #B1005', date: 'Mar 20, 2024', amount: '+$120.00', status: 'Success' },
                  { id: 'T2003', type: 'Credit', desc: 'Bonus Referral Reward', date: 'Mar 15, 2024', amount: '+$50.00', status: 'Success' },
                  { id: 'T2004', type: 'Credit', desc: 'Service Completion #B1009', date: 'Mar 10, 2024', amount: '+$85.00', status: 'Success' },
                ].map((t) => (
                  <div key={t.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 py-6 px-4 rounded-xl transition-all" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <div className="flex gap-5 items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type === 'Credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {t.type === 'Credit' ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t.desc}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          <span className="text-[#2563EB]">#{t.id}</span>
                          <span>•</span>
                          <span>{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                      <span className={`font-black text-lg ${t.type === 'Credit' ? 'text-green-500' : 'text-red-500'}`}>{t.amount}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded" style={{ color: 'var(--text-primary)' }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
