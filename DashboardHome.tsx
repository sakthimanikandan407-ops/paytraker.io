import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 group">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-').replace('text-', 'text-')} border border-white/5 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'} uppercase tracking-widest`}>
                    {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(change)}%
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
    const [stats, setStats] = useState({
        outstanding: 0,
        collectedMtd: 0,
        overdue: 0,
        totalInvoiced: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
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

            // Calculate Chart Data (Last 6 Months Revenue)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return { month: d.getMonth(), year: d.getFullYear(), name: months[d.getMonth()], amount: 0 };
            });

            invoices.forEach(inv => {
                if (inv.status === 'paid') {
                    const d = inv.paid_at ? new Date(inv.paid_at) : new Date(inv.created_at);
                    const match = last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
                    if (match) {
                        match.amount += Number(inv.total) || 0;
                    }
                }
            });

            setChartData(last6Months);
            setRecentActivity(invoices.slice(0, 5));
            setLoading(false);
        };

        fetchDashboardData();
    }, [user]);

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats.outstanding)}
                    change={0} // Can be calculated vs last month in the future
                    icon={Clock}
                    color="bg-amber-500/10 text-amber-400"
                />
                <StatCard
                    title="Collected MTD"
                    value={formatCurrency(stats.collectedMtd)}
                    change={0}
                    icon={CheckCircle2}
                    color="bg-indigo-500/10 text-indigo-400"
                />
                <StatCard
                    title="Overdue"
                    value={`${stats.overdue} Invoices`}
                    icon={AlertCircle}
                    color="bg-rose-500/10 text-rose-400"
                />
                <StatCard
                    title="Total Invoiced"
                    value={formatCurrency(stats.totalInvoiced)}
                    change={0}
                    icon={DollarSign}
                    color="bg-violet-500/10 text-violet-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Revenue Analytics</h3>
                            <p className="text-sm text-slate-500 font-medium">Last 6 Months Actual Revenue</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
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
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        padding: '20px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '14px' }}
                                    labelStyle={{ color: '#6366f1', marginBottom: '8px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    formatter={(value: any, name: any) => [`$${value}`, name === 'amount' ? 'Revenue' : name]}
                                />
                                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                    {chartData.map((_, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === chartData.length - 1 ? 'url(#barGradient)' : 'rgba(255,255,255,0.05)'}
                                            className="transition-all duration-500 hover:opacity-80"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Side List */}
                <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Activity</h3>
                            <p className="text-sm text-slate-500 font-medium">Latest invoices</p>
                        </div>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-10">
                            <AlertCircle size={32} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-500 text-sm font-bold">No activity yet</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recentActivity.map((inv) => {
                                const initial = inv.clients?.name ? inv.clients.name.substring(0, 2).toUpperCase() : '??';
                                const isPaid = inv.status === 'paid';
                                return (
                                    <div key={inv.id} className="flex items-center justify-between group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-all">
                                        <div className="flex items-center gap-5 overflow-hidden">
                                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 border border-white/5 transition-all font-black text-sm">
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-white tracking-tight truncate">{inv.invoice_number}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                                    {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-white tracking-tight">
                                                {formatCurrency(inv.total, inv.currency)}
                                            </p>
                                            <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {inv.status}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
