import React from 'react';
import { NavLink } from 'react-router';
import { Handshake, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111827] border-t border-white/5 py-16 px-8 md:px-16 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        {/* About */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2563EB] rounded overflow-hidden flex items-center justify-center">
              <img src="/src/assets/logo.png" alt="ServiceSetu Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Service<span className="text-[#2563EB]">Setu</span>
            </span>
          </div>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            Your trusted marketplace for finding reliable local services and skilled professionals. Making services easy for everyone.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-white font-semibold text-lg">Quick Links</h4>
          <ul className="space-y-4">
            {['Home', 'Services', 'About Us', 'Contact'].map((item) => (
              <li key={item}>
                <NavLink 
                  to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '')}`}
                  className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors text-sm"
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-6">
          <h4 className="text-white font-semibold text-lg">Services</h4>
          <ul className="space-y-4">
            {['Electrician', 'Plumber', 'Cleaning', 'Repair'].map((item) => (
              <li key={item}>
                <NavLink to="/services" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors text-sm">
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="text-white font-semibold text-lg">Contact Us</h4>
          <ul className="space-y-4 text-sm text-[#9CA3AF]">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-[#2563EB]" />
              <span>123 Market St, San Francisco, CA</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#2563EB]" />
              <span>+1 (555) 000-0000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#2563EB]" />
              <span>support@servicesetu.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[#4B5563] text-sm">
          &copy; {new Date().getFullYear()} ServiceSetu. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-[#4B5563]">
          <a href="#" className="hover:text-[#2563EB] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#2563EB] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
