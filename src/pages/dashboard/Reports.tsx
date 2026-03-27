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
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const KPICard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-110 transition-transform ${color}`} />
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(trend)}%
            </div>
        </div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
    </div>
);

const ReportsPage = () => {
    const [data, setData] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        // Generate dummy chart data for now
        const dummyData = [
            { name: 'Jan', revenue: 4500, count: 12 },
            { name: 'Feb', revenue: 5200, count: 15 },
            { name: 'Mar', revenue: 4800, count: 14 },
            { name: 'Apr', revenue: 6100, count: 18 },
            { name: 'May', revenue: 5900, count: 17 },
            { name: 'Jun', revenue: 7500, count: 22 },
        ];
        setData(dummyData);
    }, []);

    const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981'];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-600 shadow-sm">
                        <Calendar size={18} />
                        Jan 2024 - Jun 2024
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm shadow-slate-200/50">
                    <Download size={18} /> Export PDF
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <KPICard
                    title="Total Revenue"
                    value="$34,500.00"
                    subValue="+$4,200 from last month"
                    trend={12.5}
                    icon={DollarSign}
                    color="bg-indigo-50 text-indigo-600"
                />
                <KPICard
                    title="Conversion Rate"
                    value="94.2%"
                    subValue="Industry average: 82%"
                    trend={5.2}
                    icon={FileCheck}
                    color="bg-emerald-50 text-emerald-600"
                />
                <KPICard
                    title="Client Growth"
                    value="+18"
                    subValue="New clients this period"
                    trend={-2.4}
                    icon={Users}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Revenue Flow</h3>
                            <p className="text-sm text-slate-400">Monthly breakdown of billed amounts</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Distribution */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Statuses</h3>
                    <p className="text-sm text-slate-400 mb-8">Payment status distribution</p>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Paid', value: 45 },
                                        { name: 'Pending', value: 25 },
                                        { name: 'Overdue', value: 15 },
                                        { name: 'Draft', value: 15 },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">100%</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Health</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        {['Paid', 'Pending', 'Overdue', 'Draft'].map((status, i) => (
                            <div key={status} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-sm font-bold text-slate-600">{status}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-400">{i === 0 ? '45%' : i === 1 ? '25%' : '15%'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
