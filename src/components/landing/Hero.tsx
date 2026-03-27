import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="pt-32 pb-20 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto text-center relative">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
                        ✦ Invoice automation for freelancers
                    </span>
                    <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
                        Get Paid. <span className="gradient-heading">Not Ignored.</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Automate invoice reminders in INR and USD. Stop chasing clients.
                        Start getting paid on time, every time.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <button className="btn-primary text-lg px-8 py-4">
                            Start Free — No Card →
                        </button>
                        <button className="btn-secondary text-lg px-8 py-4">
                            See How It Works ↓
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center pt-8 border-t border-slate-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">2,400+</div>
                            <div className="text-slate-500 text-sm">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">$12M+</div>
                            <div className="text-slate-500 text-sm">Tracked Yearly</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">94%</div>
                            <div className="text-slate-500 text-sm">Collection Rate</div>
                        </div>
                    </div>
                </motion.div>

                {/* Demo Card Floating */}
                <motion.div
                    className="mt-20 max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 relative group"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-left">
                            <div className="text-xs text-slate-400 font-mono">INV-0042</div>
                            <div className="font-bold text-slate-900">Design Services</div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                            PAID ✓
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2 font-mono">₹1,00,000</div>
                    <div className="text-xs text-slate-400">Paid on March 15, 2024</div>

                    <div className="absolute -right-12 -bottom-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden md:block">
                        <div className="text-xs text-indigo-600 font-bold mb-1">Reminder Sent</div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
