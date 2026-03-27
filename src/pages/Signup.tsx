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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
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
                    <h2 className="text-2xl font-bold text-slate-900 mt-4">Start Getting Paid</h2>
                    <p className="text-slate-500 mt-2">Create your professional account today</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
                            <p className="text-slate-500 mb-8">
                                We've sent a verification link to <span className="font-semibold text-slate-900">{email}</span>. Please click the link to confirm your account.
                            </p>
                            <a href="/login" className="btn-primary inline-block w-full text-center">
                                Back to Sign In
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

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
                                <label className="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('USD')}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-semibold ${currency === 'USD'
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        🇺🇸 USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrency('INR')}
                                        className={`flex-1 py-3 rounded-xl border transition-all font-semibold ${currency === 'INR'
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        🇮🇳 INR
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="text-[10px] text-slate-400 mt-2 px-1">At least 6 characters. Use special characters for strength.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3.5 shadow-indigo-200 shadow-lg mt-2 disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Create Account →'}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-all">
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                                Sign up with Google
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-slate-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                        Sign in
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
