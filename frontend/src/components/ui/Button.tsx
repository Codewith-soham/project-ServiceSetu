import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px]';
  
  const variants = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#3B82F6] shadow-lg shadow-blue-500/20',
    secondary: 'bg-[#1E293B] text-[#F9FAFB] hover:bg-[#334155]',
    outline: 'border border-[#334155] text-[#F9FAFB] hover:bg-[#1E293B]',
    destructive: 'text-red-400 hover:text-red-600 border border-red-900/30 hover:bg-red-950/20',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    full: 'h-12 w-full text-base'
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
