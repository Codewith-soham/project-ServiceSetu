import React from 'react';
import {
  Zap,
  Droplets,
  SprayCan,
  Wrench,
  Hammer,
  Paintbrush,
  Bug,
  Wind,
} from 'lucide-react';

const iconMap = {
  Zap,
  Droplets,
  SprayCan,
  Wrench,
  Hammer,
  Paintbrush,
  Bug,
  Wind,
};

type ServiceIconKey = keyof typeof iconMap;

type ServiceIconProps = {
  icon: ServiceIconKey | React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
  size?: number;
};

const ServiceIcon: React.FC<ServiceIconProps> = ({ icon, className, size = 24 }) => {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

export default ServiceIcon;