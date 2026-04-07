import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, Mail, Lock, ShieldCheck, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            await login(formData.email, formData.password, (userRole) => {
                if (userRole === 'provider') {
                    navigate('/provider/dashboard', { replace: true });
                } else {
                    navigate('/user/dashboard', { replace: true });
                }
            });
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex animate-fade-in bg-[#0F172A]">
            {/* Left Side — Artistic Hero Area */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-[#0F172A] z-0" />
                <img
                    src="/src/assets/auth-city.png"
                    alt="ServiceSetu"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                
                <div className="relative z-10 flex flex-col justify-center px-20 py-20">
                    <div className="space-y-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                            <ShieldCheck size={16} />
                            Secure Access
                        </div>
                        
                        <h2 className="text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                            Welcome<br />
                            Back to<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
                                ServiceSetu
                            </span>
                        </h2>
                        
                        <p className="text-xl text-white/60 leading-relaxed max-w-md">
                            Join thousands of users and service providers on the most reliable platform for local home services.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side — Unified Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 py-10">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-bold text-white tracking-tight">Sign <span className="text-indigo-500">In</span></h1>
                        </div>
                        <p className="text-[#9CA3AF] text-base leading-relaxed">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Email or Phone"
                                placeholder="john@example.com or +91 98765 43210"
                                type="email"
                                icon={<Mail size={18} className="text-white/40" />}
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="Password"
                                placeholder="••••••••"
                                type="password"
                                icon={<Lock size={18} className="text-white/40" />}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            size="full" 
                            className="h-14 font-bold text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transform transition-all active:scale-[0.98]" 
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <LogIn size={20} />
                                    Sign In
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm space-y-6 pt-6 border-t border-white/5">
                        <p className="text-[#9CA3AF]">
                            Don't have an account? <Link to="/signup" className="text-indigo-500 font-bold hover:underline">Sign Up</Link>
                        </p>
                        
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mx-auto text-xs"
                        >
                            <ArrowLeft size={14} />
                            Return to Website
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
