import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.toLowerCase().includes('email not confirmed')) {
                setError('Please confirm your email address before signing in. Check your inbox for a verification link.');
            } else {
                setError(error.message);
            }
        } else {
            window.location.href = '/dashboard';
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <a href="/" className="text-3xl font-bold gradient-heading mb-4 inline-block">
                        PAY⚡TRACK
                    </a>
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to manage your invoices</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 shadow-indigo-200 shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-all">
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                            Continue with Google
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-500">
                    Don't have an account?{' '}
                    <a href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
                        Create account
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
