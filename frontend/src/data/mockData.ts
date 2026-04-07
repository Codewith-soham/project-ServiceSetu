export const services = [
  { id: 'electrician', name: 'Electrician', icon: 'Zap', color: 'text-yellow-400', bg: 'bg-yellow-400/10', description: 'Expert electrical repairs, installations, and maintenance for your home or office.' },
  { id: 'plumber', name: 'Plumber', icon: 'Droplets', color: 'text-blue-400', bg: 'bg-blue-400/10', description: 'Professional plumbing services including leak repair, pipe installation, and drainage solutions.' },
  { id: 'cleaning', name: 'Cleaning', icon: 'SprayCan', color: 'text-green-400', bg: 'bg-green-400/10', description: 'Deep cleaning, regular housekeeping, and specialized sanitization services.' },
  { id: 'repair', name: 'Repair', icon: 'Wrench', color: 'text-purple-400', bg: 'bg-purple-400/10', description: 'General home repairs, appliance fixing, and handyman services.' },
  { id: 'carpenter', name: 'Carpenter', icon: 'Hammer', color: 'text-orange-400', bg: 'bg-orange-400/10', description: 'Custom furniture, woodwork repairs, and structural carpentry.' },
  { id: 'painter', name: 'Painter', icon: 'Paintbrush', color: 'text-pink-400', bg: 'bg-pink-400/10', description: 'Interior and exterior painting, wallpaper installation, and surface finishing.' },
  { id: 'pestcontrol', name: 'Pest Control', icon: 'Bug', color: 'text-red-400', bg: 'bg-red-400/10', description: 'Effective pest eradication and prevention for a safe, pest-free environment.' },
  { id: 'acrepair', name: 'AC Repair', icon: 'Wind', color: 'text-cyan-400', bg: 'bg-cyan-400/10', description: 'AC servicing, gas refilling, and cooling system troubleshooting.' },
];

export const mockBookings = [
  { id: 'B1001', userId: 'u1', provider: 'Alex Johnson', service: 'Electrician', date: '2024-04-10', time: '10:00 AM', amount: '₹120', status: 'Pending' },
  { id: 'B1002', userId: 'u1', provider: 'Maria Garcia', service: 'Cleaning', date: '2024-03-25', time: '02:00 PM', amount: '₹60', status: 'Completed' },
  { id: 'B1003', userId: 'u1', provider: 'David Chen', service: 'Plumber', date: '2024-03-15', time: '09:00 AM', amount: '₹80', status: 'Cancelled' },
];

export const providerBookings = [
  { id: 'B1001', user: 'John Doe', service: 'Standard Repair', date: '2024-04-10', time: '10:00 AM', amount: '₹120', status: 'Pending' },
  { id: 'B1004', user: 'Emma Wilson', service: 'Basic Inspection', date: '2024-04-12', time: '11:00 AM', amount: '₹45', status: 'Accepted' },
  { id: 'B1005', user: 'Michael Brown', service: 'Full Installation', date: '2024-04-15', time: '01:00 PM', amount: '₹350', status: 'Pending' },
];
