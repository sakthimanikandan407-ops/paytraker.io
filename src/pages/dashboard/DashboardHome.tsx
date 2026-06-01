import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ArrowUpRight, 
    AlertTriangle,
    Loader2,
    Briefcase
} from 'lucide-react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { formatCurrency } from '../../lib/currency';
import type { Profile, Invoice, Client } from '../../types/database';
import OnboardingChecklist from '../../components/dashboard/OnboardingChecklist';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    color: string;
}

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    link: string;
}

const StatCard = ({ title, value, change, icon: Icon, color }: StatCardProps) => (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-').replace('text-', 'text-')} border border-white/5 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {change !== undefined && change > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    <ArrowUpRight size={14} />
                    {change}%
                </div>
            )}
        </div>
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</p>
    </div>
);

const DashboardHome = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState({
        outstanding: 0,
        collectedMtd: 0,
        overdue: 0,
        totalInvoiced: 0
    });
    const [activeProjectsCount, setActiveProjectsCount] = useState(7);
    const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
    const [recentActivity, setRecentActivity] = useState<(Invoice & { clients: Client })[]>([]);

    // Mock Composed Chart Data scaled to perfectly match mockup relative heights and slopes
    const composedChartData = [
        { name: 'Jan', revenue: 620000, collected: 450000 },
        { name: 'Feb', revenue: 850000, collected: 520000 },
        { name: 'Mar', revenue: 980000, collected: 680000 },
        { name: 'Apr', revenue: 1320000, collected: 810000 },
        { name: 'May', revenue: 1245000, collected: 972000 }
    ];

    // Mock Client Breakdown Donut Chart Data matching the mockup exactly
    const clientBreakdownData = [
        { name: 'TechCorp', value: 45, color: '#6366f1' },  // Indigo
        { name: 'CreativeCo', value: 30, color: '#a78bfa' }, // Violet
        { name: 'Startups', value: 25, color: '#14b8a6' }   // Teal
    ];

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileData) setProfile(profileData);

            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('*, clients(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error || !invoices) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
                return;
            }

            // Calculate Stats
            let outstanding = 0;
            let collectedMtd = 0;
            let overdue = 0;
            let totalInvoiced = 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            invoices.forEach(inv => {
                const total = Number(inv.total) || 0;
                totalInvoiced += total;

                if (inv.status === 'paid') {
                    const paidDate = inv.paid_at ? new Date(inv.paid_at) : new Date(inv.created_at);
                    if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
                        collectedMtd += total;
                    }
                } else if (inv.status === 'overdue') {
                    overdue += 1;
                    outstanding += total;
                } else if (inv.status === 'sent' || inv.status === 'viewed') {
                    outstanding += total;
                    if (new Date(inv.due_date) < now) {
                        overdue += 1;
                    }
                }
            });

            setStats({ outstanding, collectedMtd, overdue, totalInvoiced });
            setRecentActivity(invoices.slice(0, 5));
            
            // Read active projects from localStorage
            const localProj = localStorage.getItem(`paytrack_projects_${user.id}`);
            if (localProj) {
                const parsed = JSON.parse(localProj);
                const activeCount = parsed.filter((p: any) => p.status === 'active').length;
                setActiveProjectsCount(activeCount);
            } else {
                setActiveProjectsCount(7);
            }

            // Fetch Clients for onboarding check
            const { count: clientCount } = await supabase
                .from('clients')
                .select('*', { count: 'exact', head: true });

            // Onboarding Steps logic
            setOnboardingSteps([
                {
                    id: 'profile',
                    title: 'Configure Profile',
                    description: 'Set your business name and details for professional invoices.',
                    completed: !!(profileData?.full_name || profileData?.company_name || user.user_metadata?.full_name),
                    link: '/dashboard/settings'
                },
                {
                    id: 'client',
                    title: 'Add First Client',
                    description: 'Add your first client to start tracking their payments.',
                    completed: (clientCount || 0) > 0,
                    link: '/dashboard/clients'
                },
                {
                    id: 'invoice',
                    title: 'Create Invoice',
                    description: 'Send your first invoice and automated reminders.',
                    completed: invoices.length > 0,
                    link: '/dashboard/invoices'
                }
            ]);

            setLoading(false);
        };

        const checkPaymentParams = async () => {
            const params = new URLSearchParams(window.location.search);
            const status = params.get('status');
            const plan = params.get('plan');
            const paymentId = params.get('payment_id');
            const subscriptionId = params.get('subscription_id');

            if (status === 'succeeded' && plan) {
                try {
                    // Update user profile in Supabase
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            plan: plan,
                            subscription_status: 'active',
                            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                            dodo_customer_id: `cust_${Math.random().toString(36).substring(2, 11)}`,
                            dodo_subscription_id: subscriptionId || `sub_${Math.random().toString(36).substring(2, 11)}`
                        })
                        .eq('id', user.id);

                    if (updateError) throw updateError;

                    // Log transaction record
                    await supabase.from('payment_history').insert({
                        user_id: user.id,
                        dodo_payment_id: paymentId || `pay_${Math.random().toString(36).substring(2, 11)}`,
                        amount: plan === 'starter' ? 599 : plan === 'pro' ? 999 : 2799,
                        currency: 'INR',
                        plan: plan,
                        status: 'succeeded'
                    });

                    // Clear query parameters
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                    
                } catch (e) {
                    console.error('Error handling payment success redirect:', e);
                }
            }
        };

        checkPaymentParams().then(() => {
            fetchDashboardData();
        });
    }, [user]);

    const displayCurrency = (amount: number, currency?: string) => {
        return formatCurrency(amount, currency || profile?.default_currency || 'USD');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Overdue Alert Banner */}
            {stats.overdue > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 shrink-0">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Action Required</h3>
                            <p className="text-rose-100/60 text-sm font-medium uppercase tracking-widest mt-1">
                                You have {stats.overdue} overdue {stats.overdue === 1 ? 'invoice' : 'invoices'} needing attention.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/dashboard/invoices'}
                        className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 whitespace-nowrap"
                    >
                        Resolve Now →
                    </button>
                </div>
            )}

            {/* Onboarding Checklist */}
            {onboardingSteps.some(s => !s.completed) && (
                <div className="mb-12">
                    <OnboardingChecklist steps={onboardingSteps} />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Outstanding"
                    value={displayCurrency(stats.outstanding)}
                    change={5.2}
                    icon={Clock}
                    color="bg-amber-500/10 text-amber-400"
                />
                <StatCard
                    title="Collected MTD"
                    value={displayCurrency(stats.collectedMtd)}
                    change={12}
                    icon={CheckCircle2}
                    color="bg-indigo-500/10 text-indigo-400"
                />
                <StatCard
                    title="Pending Invoices"
                    value={`${stats.overdue} Invoices`}
                    icon={AlertCircle}
                    color="bg-rose-500/10 text-rose-400"
                />
                <StatCard
                    title="Active Projects"
                    value={`${activeProjectsCount}`}
                    icon={Briefcase}
                    color="bg-violet-500/10 text-violet-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Composed Chart: Revenue & Collection overlay */}
                <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Revenue Performance</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Monthly Billing vs Collections</p>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={composedChartData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(val) => displayCurrency(val).replace(/\.00$/, '')}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        padding: '20px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '13px' }}
                                    labelStyle={{ color: '#6366f1', marginBottom: '8px', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    formatter={(value: any, name: any) => [
                                        displayCurrency(value), 
                                        name === 'revenue' ? 'Monthly Revenue' : 'Payments Collected'
                                    ]}
                                />
                                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                                <Line 
                                    type="monotone" 
                                    dataKey="collected" 
                                    stroke="#a78bfa" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#a78bfa', strokeWidth: 2, r: 5 }} 
                                    activeDot={{ r: 7 }} 
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Client Breakdown Donut Chart */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Client Breakdown</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 font-sans">Workspace distribution</p>
                    </div>

                    {/* Donut graph */}
                    <div className="h-[220px] w-full relative flex items-center justify-center my-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={clientBreakdownData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {clientBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Share</span>
                            <span className="text-3xl font-black text-white">100%</span>
                        </div>
                    </div>

                    {/* Legends */}
                    <div className="space-y-3">
                        {clientBreakdownData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-300">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: item.color }} />
                                    <span className="text-white">{item.name}</span>
                                </div>
                                <span className="text-slate-500">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Invoices & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Invoices Table */}
                <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Recent Invoices</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Transmissions history</p>
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs font-black uppercase tracking-widest">
                            No invoices dispatched yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice ID</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                        <th className="pb-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map((inv) => (
                                        <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                                            <td className="py-4 text-xs font-mono font-bold text-white">{inv.invoice_number}</td>
                                            <td className="py-4 text-xs font-bold text-indigo-400 uppercase tracking-wide">{inv.clients?.name || 'Unknown'}</td>
                                            <td className="py-4 text-xs text-slate-400 font-semibold">
                                                {new Date(inv.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-4 text-xs font-black text-white">
                                                {displayCurrency(Number(inv.total), inv.currency)}
                                            </td>
                                            <td className="py-4 text-xs text-right">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                    inv.status === 'paid' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Additional Quick Stats Card */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Billing Status</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Platform details</p>
                    </div>

                    <div className="space-y-4 my-6">
                        <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan Type</span>
                            <span className="text-xs font-black text-indigo-400 uppercase tracking-wide bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                                {profile?.plan || 'Free'} Plan
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gateway partner</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                                Dodo Payments
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold leading-normal uppercase tracking-wider">
                            Automated reminders and currency configurations are securely processed in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
