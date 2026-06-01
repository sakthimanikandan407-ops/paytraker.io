import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
    CreditCard, 
    ShieldCheck, 
    Calendar, 
    Receipt, 
    Loader2, 
    Zap, 
    ExternalLink
} from 'lucide-react';

const plansDetails = {
    free: { name: 'Free Tier', priceUSD: 0, priceINR: 0, color: 'text-slate-400' },
    starter: { name: 'Starter Pro', priceUSD: 7, priceINR: 599, color: 'text-amber-400' },
    pro: { name: 'Pro Elite', priceUSD: 15, priceINR: 999, color: 'text-violet-400' },
    studio: { name: 'Studio Agency', priceUSD: 35, priceINR: 2799, color: 'text-emerald-400' }
};

const BillingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Extract Dodo Business ID from publishable key
    const publishableKey = import.meta.env.VITE_DODO_PUBLISHABLE_KEY || '';
    const businessId = publishableKey.split('.')[0] || 'ok1qqwt67Kyq5E4w';
    const dodoPortalUrl = `https://test.customer.dodopayments.com/login/${businessId}`;

    useEffect(() => {
        if (!user) return;
        fetchBillingData();
    }, [user]);

    const fetchBillingData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (profileData) {
                setProfile(profileData);
            }

            // 2. Fetch Payments
            const { data: paymentData } = await supabase
                .from('payment_history')
                .select('*')
                .eq('user_id', user?.id)
                .order('paid_at', { ascending: false });
            if (paymentData) {
                setPayments(paymentData);
            }
        } catch (err) {
            console.error('Error fetching billing info:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
            </div>
        );
    }

    const currentPlan = (profile?.plan || 'free') as keyof typeof plansDetails;
    const planInfo = plansDetails[currentPlan];
    const currency = profile?.default_currency || 'USD';
    const symbol = currency === 'USD' ? '$' : '₹';
    const finalPrice = currency === 'USD' ? planInfo.priceUSD : planInfo.priceINR;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Billing Portal</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Manage subscriptions, Dodo gateway details, and receipts.</p>
            </div>

            {/* Dodo Payments Official Portal Redirect Card */}
            <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-slate-900/60 backdrop-blur-xl border border-indigo-500/20 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck size={12} />
                            Verified Secure Integration
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">Official Dodo Customer Portal</h2>
                        <p className="text-slate-400 text-sm font-semibold max-w-2xl leading-relaxed">
                            For security and privacy, credit card details, subscription modifications, and invoices are handled directly inside your **Dodo Payments Customer Portal**. 
                            Simply enter your account email (<span className="text-indigo-300 font-bold">{user?.email}</span>) at the login link to receive a secure access link.
                        </p>
                    </div>
                    <a
                        href={dodoPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 w-full lg:w-auto"
                    >
                        <span>Open Dodo Portal</span>
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>

            {/* Billing Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Active Plan details card */}
                <div className="md:col-span-7 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Subscription</span>
                            <h3 className={`text-3xl font-black tracking-tight ${planInfo.color} uppercase`}>
                                {planInfo.name}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-2xl font-black text-white">
                                {symbol}{finalPrice}
                                <span className="text-xs font-bold text-slate-500">/mo</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 shadow-glow mt-1.5">
                                {profile?.subscription_status === 'active' ? 'Renewing Automatically' : 'Trial Active'}
                            </span>
                        </div>
                    </div>

                    {/* Dodo details */}
                    <div className="grid grid-cols-2 gap-6 bg-white/2 p-6 rounded-2xl border border-white/5 text-xs">
                        <div className="space-y-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Dodo Customer ID</span>
                            <p className="font-mono text-white font-bold">{profile?.dodo_customer_id || 'Not generated'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Dodo Subscription ID</span>
                            <p className="font-mono text-white font-bold">{profile?.dodo_subscription_id || 'Not generated'}</p>
                        </div>
                        <div className="space-y-1 col-span-2 pt-2 border-t border-white/5 flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                                <Calendar size={14} className="text-indigo-400" />
                                Next Renewal Date
                            </span>
                            <span className="font-bold text-white">
                                {profile?.trial_ends_at 
                                    ? new Date(profile.trial_ends_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Actions redirecting directly to Dodo portal */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        {currentPlan !== 'free' ? (
                            <>
                                <a
                                    href={dodoPortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all text-center"
                                >
                                    <CreditCard size={16} />
                                    Update Card details
                                </a>
                                <a
                                    href={dodoPortalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl font-black text-xs uppercase tracking-widest text-rose-400 transition-all text-center"
                                >
                                    Cancel Subscription
                                </a>
                            </>
                        ) : (
                            <Link
                                to="/dashboard/payment?plan=pro"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Zap size={16} />
                                Upgrade Workspace Plan
                            </Link>
                        )}
                    </div>
                </div>

                {/* Secure info card */}
                <div className="md:col-span-5 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-glow">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Security & Payments</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                            PayTrack relies entirely on **Dodo Payments** for invoice settlement, card security, and trial management. Your personal and financial details are protected using AES-256 bank-level encryption.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Change Workspace Plan</span>
                        <div className="flex gap-2">
                            {['starter', 'pro', 'studio'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => navigate(`/dashboard/payment?plan=${p}`)}
                                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all border ${
                                        currentPlan === p
                                            ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                                            : 'bg-white/2 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Local Receipts Log */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Receipt size={22} className="text-indigo-400" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Local Receipt Logs</h3>
                </div>

                {payments.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                        No transactions recorded. Upgrade to a premium plan to see receipts.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Receipt ID</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="pb-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Gateway</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((pay) => (
                                    <tr key={pay.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                        <td className="py-4 text-xs font-mono font-bold text-white">{pay.dodo_payment_id || 'pay_unknown'}</td>
                                        <td className="py-4 text-xs font-bold text-indigo-400 uppercase tracking-wide">{pay.plan}</td>
                                        <td className="py-4 text-xs text-slate-400 font-semibold">
                                            {new Date(pay.paid_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-4 text-xs font-black text-white">
                                            {pay.currency === 'USD' ? '$' : '₹'}{pay.amount}
                                        </td>
                                        <td className="py-4 text-xs">
                                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {pay.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs font-bold text-slate-500 text-right uppercase tracking-wider">Dodo Payments</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingPage;
