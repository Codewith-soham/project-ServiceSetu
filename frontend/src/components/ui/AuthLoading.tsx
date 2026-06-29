import React from 'react';

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default AuthLoading;
