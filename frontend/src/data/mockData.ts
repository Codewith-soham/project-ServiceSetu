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

export const providers = [
  {
    id: 'p1',
    name: 'Alex Johnson',
    service: 'Electrician',
    serviceId: 'electrician',
    rating: 4.9,
    reviews: 124,
    experience: '8 years',
    pricing: '$45/hr',
    location: 'Downtown, San Francisco',
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop',
    bio: 'Professional electrician specializing in smart home installations and complex electrical troubleshooting. Licensed and insured.',
    packages: [
      { id: 'pkg1', name: 'Basic Inspection', price: 45, time: '1 hr', features: ['System check', 'Diagnosis', 'Minor fixes'] },
      { id: 'pkg2', name: 'Standard Repair', price: 120, time: '3 hrs', features: ['Parts replacement', 'Rewiring', 'Testing'] },
      { id: 'pkg3', name: 'Full Installation', price: 350, time: 'Full Day', features: ['New point setup', 'Panel upgrade', 'Warranty'] },
    ]
  },
  {
    id: 'p2',
    name: 'Maria Garcia',
    service: 'Cleaning',
    serviceId: 'cleaning',
    rating: 4.8,
    reviews: 89,
    experience: '5 years',
    pricing: '$30/hr',
    location: 'Oakland, CA',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    bio: 'Dedicated cleaning professional providing eco-friendly deep cleaning services for residential and commercial spaces.',
    packages: [
      { id: 'pkg4', name: 'Routine Clean', price: 60, time: '2 hrs', features: ['Dusting', 'Vacuuming', 'Bathroom & Kitchen'] },
      { id: 'pkg5', name: 'Deep Clean', price: 150, time: '5 hrs', features: ['Window cleaning', 'Appliance exterior', 'Intense floor care'] },
    ]
  },
  {
    id: 'p3',
    name: 'David Chen',
    service: 'Plumber',
    serviceId: 'plumber',
    rating: 5.0,
    reviews: 56,
    experience: '12 years',
    pricing: '$60/hr',
    location: 'San Jose, CA',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    bio: 'Master plumber with extensive experience in emergency repairs and modern plumbing systems. Guaranteed work.',
    packages: [
      { id: 'pkg6', name: 'Quick Fix', price: 80, time: '1 hr', features: ['Leak repair', 'Drain cleaning'] },
      { id: 'pkg7', name: 'Bathroom Overhaul', price: 500, time: '2 Days', features: ['Fixture installation', 'New piping'] },
    ]
  },
  // Adding more for variety
  {
    id: 'p4',
    name: 'Sarah Miller',
    service: 'Painter',
    serviceId: 'painter',
    rating: 4.7,
    reviews: 42,
    experience: '6 years',
    pricing: '$40/hr',
    location: 'Berkeley, CA',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
    bio: 'Detail-oriented painter specializing in accent walls and high-end finishes.',
    packages: [
      { id: 'pkg8', name: 'Single Room', price: 200, time: '4 hrs', features: ['Surface prep', 'Two coats', 'Cleanup'] },
    ]
  }
];

export const mockBookings = [
  { id: 'B1001', userId: 'u1', provider: 'Alex Johnson', service: 'Electrician', date: '2024-04-10', time: '10:00 AM', amount: '$120', status: 'Pending' },
  { id: 'B1002', userId: 'u1', provider: 'Maria Garcia', service: 'Cleaning', date: '2024-03-25', time: '02:00 PM', amount: '$60', status: 'Completed' },
  { id: 'B1003', userId: 'u1', provider: 'David Chen', service: 'Plumber', date: '2024-03-15', time: '09:00 AM', amount: '$80', status: 'Cancelled' },
];

export const providerBookings = [
  { id: 'B1001', user: 'John Doe', service: 'Standard Repair', date: '2024-04-10', time: '10:00 AM', amount: '$120', status: 'Pending' },
  { id: 'B1004', user: 'Emma Wilson', service: 'Basic Inspection', date: '2024-04-12', time: '11:00 AM', amount: '$45', status: 'Accepted' },
  { id: 'B1005', user: 'Michael Brown', service: 'Full Installation', date: '2024-04-15', time: '01:00 PM', amount: '$350', status: 'Pending' },
];
