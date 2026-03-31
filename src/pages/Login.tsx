import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('LoginPage: Attempting login for', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('LoginPage: Login error', error);
            if (error.message.toLowerCase().includes('email not confirmed')) {
                setError('Please confirm your email address before signing in. Check your inbox for a verification link.');
            } else {
                setError(error.message);
            }
        } else {
            console.log('LoginPage: Login success, redirecting to dashboard', data.user.email);
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <a href="/" className="text-4xl font-black text-white tracking-tighter mb-4 inline-block">
                        PayTrack<span className="text-indigo-400">.io</span>
                    </a>
                    <h2 className="text-2xl font-bold text-white mt-4">Welcome Back</h2>
                    <p className="text-slate-400 mt-2 font-medium">Sign in to manage your professional invoices</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-xl italic">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                                <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-xl shadow-indigo-600/20 ${loading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all active:scale-95">
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
                            Continue with Google
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm font-bold">
                    New to PayTrack?{' '}
                    <a href="/signup" className="text-indigo-400 hover:text-indigo-300">
                        Create elite account
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
