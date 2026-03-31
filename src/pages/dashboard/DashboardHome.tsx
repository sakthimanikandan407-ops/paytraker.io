import { useState, useEffect } from 'react';
import {
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
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
            <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'} uppercase tracking-widest`}>
                {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(change)}%
            </div>
        </div>
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</p>
    </div>
);

const DashboardHome = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Generate dummy chart data
        const dummyData = [
            { name: 'Mon', amount: 3200 },
            { name: 'Tue', amount: 4100 },
            { name: 'Wed', amount: 2800 },
            { name: 'Thu', amount: 5200 },
            { name: 'Fri', amount: 4800 },
            { name: 'Sat', amount: 6100 },
            { name: 'Sun', amount: 5900 },
        ];
        setData(dummyData);
    }, []);

    return (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Outstanding"
                    value="$12,450.00"
                    change={12}
                    icon={Clock}
                    color="bg-amber-500/10 text-amber-400"
                />
                <StatCard
                    title="Collected MTD"
                    value="$8,200.00"
                    change={8}
                    icon={CheckCircle2}
                    color="bg-indigo-500/10 text-indigo-400"
                />
                <StatCard
                    title="Overdue"
                    value="3 Invoices"
                    change={-2}
                    icon={AlertCircle}
                    color="bg-rose-500/10 text-rose-400"
                />
                <StatCard
                    title="Total Invoiced"
                    value="$45,000.00"
                    change={15}
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
                            <p className="text-sm text-slate-500 font-medium">Monthly performance overview</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                            <option className="bg-slate-900">Last 6 Months</option>
                            <option className="bg-slate-900">Last Year</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
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
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        padding: '20px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '14px' }}
                                    labelStyle={{ color: '#6366f1', marginBottom: '8px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    formatter={(value: any, name: any) => [`$${value}`, name]}
                                />
                                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                    {data.map((_: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === data.length - 1 ? 'url(#barGradient)' : 'rgba(255,255,255,0.05)'}
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
                        <button className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 border border-white/5 transition-all font-black text-sm">
                                        {i === 1 ? 'JD' : i === 2 ? 'AC' : i === 3 ? 'TS' : i === 4 ? 'BW' : 'MK'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white tracking-tight">INV-00{i + 40}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Mar {10 + i}, 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white tracking-tight">
                                        {i % 2 === 0 ? '₹' : '$'}{i === 1 ? '1,200.00' : '2,450.50'}
                                    </p>
                                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${i === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {i === 1 ? 'Paid' : 'Pending'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
