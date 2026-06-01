import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('plan, subscription_status, trial_ends_at')
                .eq('id', user.id)
                .single();
            if (data) {
                setProfile(data);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user]);

    const renderReminder = () => {
        if (loading || !profile) return null;

        // 1. Free/Inactive Plan
        if (profile.plan === 'free' || profile.subscription_status === 'inactive') {
            return (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-between flex-wrap gap-4 shadow-lg backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="flex-shrink-0" size={18} />
                        <span>
                            Subscription Reminder: You are on the Free Plan. Upgrade to a Pro plan and setup Auto Pay with Dodo Payments to unlock unlimited invoicing & smart reminders.
                        </span>
                    </div>
                    <Link 
                        to="/dashboard/payment?plan=pro" 
                        className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        Upgrade Now
                    </Link>
                </div>
            );
        }

        // 2. Trial Period
        if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
            const trialEnds = new Date(profile.trial_ends_at);
            const daysLeft = Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            if (daysLeft > 0) {
                return (
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-between flex-wrap gap-4 shadow-lg backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="flex items-center gap-3">
                            <Clock className="flex-shrink-0 text-indigo-400 animate-pulse" size={18} />
                            <span>
                                7-Day Free Trial Active: You have {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining. Setup Auto Pay via Dodo Payments to avoid any invoice delivery interruptions.
                            </span>
                        </div>
                        <Link 
                            to={`/dashboard/payment?plan=${profile.plan}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Setup Auto Pay
                        </Link>
                    </div>
                );
            } else {
                return (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-between flex-wrap gap-4 shadow-lg backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="flex-shrink-0" size={18} />
                            <span>
                                Trial Period Expired: Your 7-day free trial has concluded. Activate your account and enable Auto Pay with Dodo Payments to continue using PayTrack.
                            </span>
                        </div>
                        <Link 
                            to={`/dashboard/payment?plan=${profile.plan}`}
                            className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-400 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                            Activate Account
                        </Link>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
            
            <Sidebar />
            <div className="pl-64 relative z-10">
                <Topbar title={pageTitle} />
                <main className="pt-24 pb-12 px-8">
                    <div className="max-w-7xl mx-auto text-white">
                        {renderReminder()}
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Bar (Placeholder for now) */}
            <div className="md:hidden fixed bottom-1 left-1 right-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 flex justify-between items-center z-50 rounded-2xl">
                {/* Mobile icons would go here */}
            </div>
        </div>
    );
};

export default DashboardLayout;
