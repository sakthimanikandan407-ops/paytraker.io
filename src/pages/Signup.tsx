import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const SignupPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    default_currency: currency,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] opacity-30" />
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
                    <h2 className="text-2xl font-bold text-white mt-4">Start Your Elite Journey</h2>
                    <p className="text-slate-400 mt-2 font-medium">Create your professional account today</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Check your email</h3>
                            <p className="text-slate-400 mb-8 font-medium">
                                We've sent a verification link to <span className="font-bold text-white">{email}</span>. Please click the link to confirm your account.
                            </p>
                            <a href="/login" className="block w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-center uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                                Back to Sign In
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-xl italic">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

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
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Default Currency</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USD')}
                                        className={`flex-1 py-4 rounded-xl border transition-all font-bold ${currency === 'USD'
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        🇺🇸 USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('INR')}
                                        className={`flex-1 py-4 rounded-xl border transition-all font-bold ${currency === 'INR'
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                            }`}
                                    >
                                        🇮🇳 INR
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="text-[10px] text-slate-500 font-bold mt-2 px-1 uppercase tracking-tighter">At least 6 characters. Use special characters for strength.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-xl shadow-indigo-600/20 mt-2 ${loading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                            >
                                {loading ? 'Creating Elite Account...' : 'Create Account →'}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all active:scale-95">
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
                                Sign up with Google
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm font-bold">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-400 hover:text-indigo-300">
                        Sign in
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
