import React from 'react';
import { Target, Users, ShieldCheck, Heart } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Verified Pros', value: '5,000+' },
    { label: 'Happy Customers', value: '100,000+' },
    { label: 'Service Types', value: '50+' },
    { label: 'Cities Covered', value: '25+' },
  ];

  const values = [
    { icon: Target, title: 'Mission', desc: 'Connecting people with reliable local services while empowering skilled professionals to grow their business.' },
    { icon: ShieldCheck, title: 'Vision', desc: 'To be the most trusted and transparent local service marketplace globally, known for quality and speed.' },
    { icon: Heart, title: 'Values', desc: 'Trust, Transparency, Quality, and Community. We believe in creating value for both seekers and providers.' },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in py-16 px-8 md:px-16 container mx-auto">
      {/* Header */}
      <section className="text-center mb-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">About <span className="text-[#2563EB]">ServiceSetu</span></h1>
        <p className="text-[#9CA3AF] text-lg max-w-3xl mx-auto leading-relaxed">
          Founded in 2026, ServiceSetu started with a simple goal: to make finding home services as easy as ordering food online. We bridges the gap between those who need help and those who have the skills to provide it.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center p-8 glass rounded-2xl blue-glow">
            <div className="text-3xl md:text-4xl font-bold text-[#2563EB] mb-2">{stat.value}</div>
            <div className="text-[#9CA3AF] text-sm uppercase tracking-wider font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {values.map((v) => (
          <Card key={v.title} className="p-10 flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mb-8 blue-glow-hover group-hover:scale-110 transition-transform">
              <v.icon className="text-[#2563EB]" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
            <p className="text-[#9CA3AF] leading-relaxed">
              {v.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
