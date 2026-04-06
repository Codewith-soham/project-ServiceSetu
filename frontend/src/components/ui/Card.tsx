import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  glass = true, 
  glow = true, 
  interactive = false, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'rounded-[12px] p-6 transition-all duration-300',
        glass && 'glass',
        glow && 'blue-glow',
        interactive && 'hover:scale-[1.02] blue-glow-hover cursor-pointer border-white/10 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
