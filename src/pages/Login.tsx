import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgot, setShowForgot] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
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
            const planParam = new URLSearchParams(window.location.search).get('plan');
            if (planParam) {
                navigate(`/dashboard/payment?plan=${planParam}`);
            } else {
                navigate('/dashboard');
            }
        }
        setLoading(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail.trim()) {
            setResetError('Please enter your email address.');
            return;
        }
        setResetLoading(true);
        setResetError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/login`,
        });

        if (error) {
            setResetError(error.message);
        } else {
            setResetSent(true);
        }
        setResetLoading(false);
    };

    const handleBackToLogin = () => {
        setShowForgot(false);
        setResetEmail('');
        setResetSent(false);
        setResetError(null);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const planParam = new URLSearchParams(window.location.search).get('plan');
        const redirectTo = planParam 
            ? `${window.location.origin}/dashboard/payment?plan=${planParam}`
            : `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo
            }
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
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
                        PayTrack
                    </a>
                    <h2 className="text-2xl font-bold text-white mt-4">
                        {showForgot ? 'Reset Password' : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">
                        {showForgot
                            ? 'Enter your email to receive a password reset link'
                            : 'Sign in to manage your professional invoices'}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">

                    {/* ── Forgot Password View ── */}
                    {showForgot ? (
                        <div className="space-y-6">
                            {resetSent ? (
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Check Your Inbox</h3>
                                        <p className="text-slate-400 text-sm mt-2 font-medium">
                                            We sent a password reset link to <span className="text-indigo-400 font-bold">{resetEmail}</span>.
                                            Check your email and follow the link to reset your password.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleBackToLogin}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        ← Back to Sign In
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-6">
                                    {resetError && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-xl italic">
                                            {resetError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                            placeholder="you@example.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-xl shadow-indigo-600/20 ${resetLoading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
                                    >
                                        {resetLoading ? 'Sending...' : 'Send Reset Link →'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        ← Back to Sign In
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* ── Login View ── */
                        <>
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
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForgot(true);
                                                setResetEmail(email);
                                            }}
                                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:bg-white/10 transition-all outline-none font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
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
                                <button 
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
                                    Continue with Google
                                </button>
                            </div>
                        </>
                    )}
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
