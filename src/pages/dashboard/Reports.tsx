import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileCheck,
    Users,
    Download,
    Calendar
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { formatCurrency } from '../../lib/currency';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';
const KPICard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
        <div className={`absolute top-0 right-0 w-40 h-40 -mr-12 -mt-12 rounded-full opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 bg-current`} />
        <div className="flex justify-between items-start mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 ${color}`}>
                <Icon size={28} />
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(trend)}%
            </div>
        </div>
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-3xl font-black text-white mt-3 tracking-tighter drop-shadow-2xl">{value}</p>
        <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-widest">{subValue}</p>
    </div>
);

const ReportsPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [statusCounts, setStatusCounts] = useState({ PAID: 0, PENDING: 0, OVERDUE: 0, DRAFT: 0 });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileData) setProfile(profileData);

            // Fetch Invoices
            const { data: invoicesData } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', user.id);

            const activeInvoices = invoicesData || [];
            setInvoices(activeInvoices);

            // Generate dynamic date range (rolling 6 months)
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const now = new Date();
            const start = new Date();
            start.setMonth(now.getMonth() - 5);
            
            const startLabel = `${months[start.getMonth()]} ${start.getFullYear()}`;
            const endLabel = `${months[now.getMonth()]} ${now.getFullYear()}`;
            setDateRange(`${startLabel} — ${endLabel}`);

            // Calculate actual monthly revenue trend (paid invoices total)
            const monthlyData = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                const monthIndex = d.getMonth();
                const year = d.getFullYear();
                
                const monthInvoices = activeInvoices.filter(inv => {
                    const invDate = new Date(inv.issue_date);
                    return invDate.getMonth() === monthIndex && invDate.getFullYear() === year;
                });
                
                const revenue = monthInvoices
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
                
                return { 
                    name: months[monthIndex], 
                    revenue: revenue, 
                    count: monthInvoices.length 
                };
            });
            setData(monthlyData);

            // Calculate Status Counts
            const counts = { PAID: 0, PENDING: 0, OVERDUE: 0, DRAFT: 0 };
            activeInvoices.forEach(inv => {
                if (inv.status === 'paid') {
                    counts.PAID += 1;
                } else if (inv.status === 'draft') {
                    counts.DRAFT += 1;
                } else if (inv.status === 'overdue') {
                    counts.OVERDUE += 1;
                } else if (inv.status === 'sent' || inv.status === 'viewed') {
                    if (new Date(inv.due_date) < now) {
                        counts.OVERDUE += 1;
                    } else {
                        counts.PENDING += 1;
                    }
                }
            });
            setStatusCounts(counts);
        };

        fetchData();
    }, [user]);

    const displayCurrency = (amount: number) => {
        return formatCurrency(amount, profile?.default_currency || 'USD');
    };

    const COLORS = ['#818cf8', '#fbbf24', '#f87171', '#34d399'];

    const totalInvoices = invoices.length;
    const pieData = totalInvoices > 0
        ? [
            { name: 'PAID', value: statusCounts.PAID, color: COLORS[0] },
            { name: 'PENDING', value: statusCounts.PENDING, color: COLORS[1] },
            { name: 'OVERDUE', value: statusCounts.OVERDUE, color: COLORS[2] },
            { name: 'DRAFT', value: statusCounts.DRAFT, color: COLORS[3] }
          ].filter(item => item.value > 0)
        : [{ name: 'NO INVOICES', value: 1, color: '#334155' }];

    const getPercentage = (count: number) => {
        if (totalInvoices === 0) return '0%';
        return `${Math.round((count / totalInvoices) * 100)}%`;
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3 text-xs font-black text-slate-400 shadow-2xl uppercase tracking-widest backdrop-blur-xl">
                        <Calendar size={18} className="text-indigo-400" />
                        {dateRange}
                    </div>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl shadow-white/5">
                    <Download size={18} /> Export Report
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <KPICard
                    title="Gross Revenue"
                    value={displayCurrency(34500)}
                    subValue={`+${displayCurrency(4200)} vs last cycle`}
                    trend={12.5}
                    icon={DollarSign}
                    color="bg-indigo-500/10 text-indigo-400"
                />
                <KPICard
                    title="Collection Rate"
                    value="94.2%"
                    subValue="Benchmark: 82%"
                    trend={5.2}
                    icon={FileCheck}
                    color="bg-emerald-500/10 text-emerald-400"
                />
                <KPICard
                    title="New Clients"
                    value="+18"
                    subValue="New clients"
                    trend={-2.4}
                    icon={Users}
                    color="bg-amber-500/10 text-amber-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Revenue Area Chart */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/10 transition-all duration-700" />
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Revenue Trend</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Monthly Summary</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                                    dy={20}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(val) => displayCurrency(val).replace(/\.00$/, '')}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#0f172a', 
                                        borderRadius: '20px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        padding: '15px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '12px' }}
                                    labelStyle={{ color: '#6366f1', marginBottom: '5px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    formatter={(value: any) => [displayCurrency(value), 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#818cf8"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Distribution */}
                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                     <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full -ml-24 -mb-24 blur-3xl group-hover:bg-purple-600/10 transition-all duration-700" />
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Invoice Breakdown</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Invoice Status distribution</p>
                    <div className="h-[180px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ 
                                         backgroundColor: '#0f172a', 
                                         borderRadius: '20px', 
                                         border: '1px solid rgba(255,255,255,0.1)',
                                         padding: '15px'
                                     }}
                                     itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '10px' }}
                                 />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className={`text-3xl font-black tracking-tighter ${totalInvoices > 0 ? 'text-white' : 'text-slate-500'}`}>{totalInvoices}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">Invoices</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 mt-6 relative z-10">
                        {[
                            { status: 'PAID', count: statusCounts.PAID, color: COLORS[0] },
                            { status: 'PENDING', count: statusCounts.PENDING, color: COLORS[1] },
                            { status: 'OVERDUE', count: statusCounts.OVERDUE, color: COLORS[2] },
                            { status: 'DRAFT', count: statusCounts.DRAFT, color: COLORS[3] }
                        ].map((item) => (
                            <div key={item.status} className="flex justify-between items-center bg-white/5 py-2.5 px-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all pointer-events-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.status}</span>
                                </div>
                                <span className="text-xs font-black text-slate-500">
                                    {getPercentage(item.count)} ({item.count})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
