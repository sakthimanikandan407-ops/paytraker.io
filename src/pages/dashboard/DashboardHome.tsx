import React from 'react';
import {
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
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

const data = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4500 },
    { name: 'May', amount: 6000 },
    { name: 'Jun', amount: 5500 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(change)}%
            </div>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
);

const DashboardHome = () => {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Outstanding"
                    value="$12,450.00"
                    change={12}
                    icon={Clock}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Collected MTD"
                    value="$8,200.00"
                    change={8}
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Overdue"
                    value="3 Invoices"
                    change={-2}
                    icon={AlertCircle}
                    color="bg-rose-50 text-rose-600"
                />
                <StatCard
                    title="Total Invoiced"
                    value="$45,000.00"
                    change={15}
                    icon={DollarSign}
                    color="bg-indigo-50 text-indigo-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold">Revenue Overview</h3>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#6366f1' : '#e2e8f0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Side List */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Recent Invoices</h3>
                        <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-bold">
                                        {i === 1 ? 'JD' : i === 2 ? 'AC' : 'TS'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">INV-00{i + 40}</p>
                                        <p className="text-xs text-slate-500">Mar {10 + i}, 2024</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">$1,200.00</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${i === 1 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {i === 1 ? 'Paid' : 'Pending'}
                                    </p>
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
