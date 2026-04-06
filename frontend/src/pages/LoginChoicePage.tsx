import React from 'react';
import { useNavigate } from 'react-router';
import { User, Briefcase, ArrowLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LoginChoicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-fade-in relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-[100px] -z-10" />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome <span className="text-[#2563EB]">Back</span></h1>
        <p className="text-[#9CA3AF] max-w-sm mx-auto">Select your role to continue to your professional dashboard or personal account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* User Card */}
        <Card 
          interactive 
          onClick={() => navigate('/user/login')}
          className="group p-10 flex flex-col items-center text-center space-y-6 blue-glow-hover"
        >
          <div className="w-20 h-20 bg-[#2563EB]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <User size={40} className="text-[#2563EB]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Login as User</h3>
            <p className="text-[#9CA3AF] text-sm">Find and book local services in minutes.</p>
          </div>
          <Button variant="outline" className="w-full">Continue as User</Button>
        </Card>

        {/* Provider Card */}
        <Card 
          interactive 
          onClick={() => navigate('/provider/login')}
          className="group p-10 flex flex-col items-center text-center space-y-6 blue-glow-hover"
        >
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Briefcase size={40} className="text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Login as Provider</h3>
            <p className="text-[#9CA3AF] text-sm">Manage your bookings and grow your business.</p>
          </div>
          <Button variant="outline" className="w-full group-hover:bg-[#1E293B]">Continue as Provider</Button>
        </Card>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="mt-12 flex items-center gap-2 text-[#4B5563] hover:text-[#2563EB] transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>
    </div>
  );
};

export default LoginChoicePage;
