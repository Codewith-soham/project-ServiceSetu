import React from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import {
  LayoutDashboard, Calendar, User as UserIcon, LogOut,
  BarChart3, BookOpen, Wallet
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isOnUserDashboard = location.pathname === '/user/dashboard';
  const isOnProviderDashboard = location.pathname === '/provider/dashboard';
  const isOnDashboard = isOnUserDashboard || isOnProviderDashboard;

  const activeTab = searchParams.get('tab') || 'dashboard';

  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const userDashboardTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const providerDashboardTabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
  ];

  const dashboardTabs = isOnProviderDashboard ? providerDashboardTabs : userDashboardTabs;
  const accentColor = isOnProviderDashboard ? 'bg-purple-600 shadow-purple-500/20' : 'bg-[#2563EB] shadow-blue-500/20';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showUserDashboardTabs = isAuthenticated && user?.role === 'user';
  const showProviderDashboardTabs = isAuthenticated && user?.role === 'provider' && isOnProviderDashboard;

  const handleTabClick = (tabId: string) => {
    const dashboardPath = user?.role === 'provider' ? '/provider/dashboard' : '/user/dashboard';
    navigate(`${dashboardPath}?tab=${tabId}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass-dark border-b border-white/5 z-50 flex items-center px-8 md:px-16 justify-between">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
          <img src="/src/assets/logo.png" alt="ServiceSetu Logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Service<span className="text-[#2563EB]">Setu</span>
        </span>
      </div>

      {/* Nav Links — switch between public and dashboard views */}
      <div className="hidden md:flex items-center gap-2">
        {showUserDashboardTabs ? (
          <>
            {userDashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isOnUserDashboard && activeTab === tab.id
                    ? `${accentColor} text-white shadow-lg`
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </>
        ) : showProviderDashboardTabs ? (
          <>
            {providerDashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                    ? `${accentColor} text-white shadow-lg`
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </>
        ) : (
          publicNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[#2563EB] px-3 py-2 ${isActive ? 'text-[#2563EB]' : 'text-[#9CA3AF]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))
        )}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </>
        ) : (isAuthenticated && user?.role === 'user') || isOnDashboard ? (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 font-bold"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(user?.role === 'user' ? '/user/dashboard' : '/provider/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
