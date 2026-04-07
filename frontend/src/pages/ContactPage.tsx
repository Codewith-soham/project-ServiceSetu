import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfos = [
    { icon: Phone, label: 'Call Us', value: '+91 98765 43210', color: 'text-blue-400' },
    { icon: Mail, label: 'Email Us', value: 'support@servicesetu.com', color: 'text-purple-400' },
    { icon: MapPin, label: 'Visit Us', value: '123 Market St, San Francisco, CA', color: 'text-green-400' },
  ];

  return (
    <div className="flex flex-col w-full animate-fade-in py-16 px-8 md:px-16 container mx-auto">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in <span className="text-[#2563EB]">Touch</span></h1>
        <p className="text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
          Questions about our platform? Need help with a booking? Our team is here to support you 24/7.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full blur-3xl -z-10" />
            
            {success ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Send className="text-green-500" size={40} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                <p className="text-[#9CA3AF]">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Phone Number (Optional)" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <Input 
                    label="Subject" 
                    placeholder="How can we help?" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">Message</label>
                  <textarea 
                    rows={5}
                    required
                    className="w-full rounded-[10px] border border-[#334155] bg-[#0F172A] px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto px-12 h-14">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="space-y-6">
            {contactInfos.map((info) => (
              <Card key={info.label} className="p-6 flex items-start gap-5 glass-dark blue-glow-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/5`}>
                  <info.icon size={24} className={info.color} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{info.label}</h4>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">{info.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-[#2563EB] text-white space-y-6 border-none">
            <HelpCircle size={40} className="text-white/30" />
            <h3 className="text-2xl font-bold">Need Help Right Now?</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Our help center has answers to the most common questions about bookings, refunds, and provider qualifications.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                variant="secondary" 
                className="bg-white text-[#2563EB] hover:bg-blue-50 border-none"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                Visit Help Center
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
