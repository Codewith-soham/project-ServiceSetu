import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab, tabs, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const firstLetter = user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#0a0a0a] lg:flex">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-[56px] z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#2a2a2a] px-4 flex justify-between items-center">
        <div className="text-[18px] font-bold text-[#F97316]">ServiceSetu</div>
        <div className="w-[34px] h-[34px] rounded-full bg-[#F97316]/20 border border-[#F97316]/30 flex items-center justify-center text-[13px] font-semibold text-[#F97316]">
          {firstLetter}
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex w-[240px] fixed left-0 top-0 bottom-0 bg-[#0d0d0d] border-r border-[#2a2a2a] flex-col py-6 z-40">
        <div className="px-5 mb-8 text-[20px] font-bold text-[#F97316]">ServiceSetu</div>
        <div className="px-3 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-200 hover:bg-[#111111] group ${
                  isActive
                    ? 'bg-[#F97316]/10 border border-[#F97316]/20'
                    : 'bg-transparent border border-transparent'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#F97316]' : 'text-[#525252] group-hover:text-[#a3a3a3]'}`} />
                <span className={`text-[14px] ${isActive ? 'text-white font-medium' : 'text-[#525252] group-hover:text-[#a3a3a3]'}`}>
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-auto px-3 border-t border-[#2a2a2a] pt-4 mx-3">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-[10px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#F97316] text-[13px] font-semibold flex items-center justify-center flex-shrink-0">
              {firstLetter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-white font-medium truncate max-w-[120px]">{user?.fullname || 'User'}</div>
              <div className="text-[10px] text-[#525252] capitalize">{user?.role || role || 'user'}</div>
            </div>
          </div>
          <div 
            onClick={handleLogout}
            className="flex items-center gap-2 mt-3 text-[#525252] text-[13px] hover:text-[#ef4444] cursor-pointer transition-colors"
          >
            <LogOut className="w-[14px] h-[14px]" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="pt-[56px] pb-[72px] lg:pt-0 lg:pb-0 lg:ml-[240px] flex-1 min-h-screen overflow-y-auto">
        <div className="w-full h-full lg:p-8">
            {children}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#2a2a2a] z-50 grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 p-[8px_4px]"
            >
              <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-[#F97316]' : 'text-[#525252]'}`} />
              <span className={`text-[10px] tracking-[0.3px] ${isActive ? 'text-[#F97316] font-semibold' : 'text-[#525252] font-medium'}`}>
                {tab.label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-[#F97316] mt-[2px]"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
