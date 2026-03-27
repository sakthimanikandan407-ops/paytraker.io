import { useState, useEffect } from 'react';
import {
    Bell,
    History,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    Mail,
    ToggleLeft as Toggle,
    ArrowRight,
    Plus,
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const RemindersPage = () => {
    const [activeTab, setActiveTab] = useState('rules');
    const [rules, setRules] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingRules, setLoadingRules] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        if (activeTab === 'rules') {
            const { data } = await supabase.from('reminder_rules').select('*').eq('user_id', user.id).order('days_offset');
            if (data) setRules(data);
        } else if (activeTab === 'log') {
            const { data } = await supabase.from('reminder_logs').select('*, invoices(invoice_number, clients(name))').limit(20).order('sent_at', { ascending: false });
            if (data) setLogs(data);
        }
        setLoading(false);
    };

    const toggleRule = async (id: string, currentStatus: boolean) => {
        setLoadingRules(id);
        const { error } = await supabase
            .from('reminder_rules')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (!error) {
            setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
        }
        setLoadingRules(null);
    };

    const deleteRule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        const { error } = await supabase.from('reminder_rules').delete().eq('id', id);
        if (!error) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    const handleRunEngine = async () => {
        setLoading(true);
        try {
            const { runReminderEngine } = await import('../../lib/reminderEngine');
            const result = await runReminderEngine();
            alert(`Reminder engine finished! Sent: ${result.sent}, Failed: ${result.failed}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to run reminder engine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-100">
                {[
                    { id: 'rules', label: 'Reminder Rules', icon: Bell },
                    { id: 'log', label: 'History Log', icon: History },
                    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 flex items-center gap-2 text-sm font-bold relative transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'rules' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                    {/* Visual Timeline */}
                    <div className="relative pt-12 pb-24 px-8 overflow-x-auto">
                        <div className="absolute top-[72px] left-0 right-0 h-1 bg-slate-100 rounded-full -z-10 mx-24" />

                        <div className="flex justify-between min-w-[800px] relative">
                            {rules.map((rule) => {
                                const isLoading = loadingRules === rule.id;
                                return (
                                    <div key={rule.id} className="flex flex-col items-center group relative">
                                        <div className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center transition-all ${rule.is_active ? 'border-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-200 grayscale'
                                            } ${isLoading ? 'animate-pulse' : ''}`}>
                                            <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-indigo-600 animate-pulse' : 'bg-slate-200'}`} />
                                        </div>

                                        <div className="mt-4 text-center">
                                            <p className="text-sm font-bold text-slate-900 capitalize">
                                                {rule.days_offset} days {rule.trigger_type.replace('_', ' ')}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <Mail size={10} /> {rule.channel}
                                            </div>
                                        </div>

                                        <div className="absolute top-[80px] opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 bg-white p-2 rounded-xl shadow-xl border border-slate-100 flex gap-1 z-10">
                                            <button
                                                onClick={() => toggleRule(rule.id, rule.is_active)}
                                                className={`p-1.5 rounded-lg transition-colors ${rule.is_active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                                title={rule.is_active ? "Deactivate" : "Activate"}
                                            >
                                                <Toggle size={14} className={rule.is_active ? 'rotate-180 text-indigo-600' : ''} />
                                            </button>
                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                                                title="Delete"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-indigo-300 hover:text-indigo-400 transition-all bg-white">
                                    <Plus size={24} />
                                </div>
                                <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">New Rule</p>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
                            <h3 className="text-lg font-bold text-indigo-900 mb-2">Automated Sequences</h3>
                            <p className="text-indigo-700/70 text-sm mb-6 leading-relaxed">
                                PayTrack automatically checks your invoices daily. Based on these rules, we'll send emails to your clients
                                to ensure you're paid on time.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleRunEngine}
                                    disabled={loading}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center gap-2"
                                >
                                    {loading ? 'Processing...' : 'Run Reminders Now'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-600 transition-all cursor-pointer">
                                    View logic documentation
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Push Notifications</h4>
                                    <p className="text-sm text-slate-500">Enable browser alerts for sequence status.</p>
                                </div>
                                <button className="ml-auto p-2 px-4 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50">Enable</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'log' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase border-b border-slate-50">
                                <th className="px-8 py-4">Invoice #</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sent At</th>
                                <th className="px-8 py-4 text-right">Channel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i} className="h-16 animate-pulse bg-white border-b border-slate-50"><td colSpan={5}></td></tr>)
                            ) : logs.length > 0 ? (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-4 font-mono font-bold text-slate-900">{log.invoices?.invoice_number}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{log.invoices?.clients?.name}</td>
                                        <td className="px-6 py-4">
                                            {log.status === 'sent' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                                    <CheckCircle2 size={14} /> Sent
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                                                    <AlertCircle size={14} /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(log.sent_at).toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase">{log.channel}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400">No reminder history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'scheduled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-slate-400 hover:text-slate-600 font-bold text-xs">Skip</button>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                                    <Clock size={18} />
                                </div>
                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">
                                    Demo Mode
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Upcoming Reminder</h4>
                            <p className="text-sm text-slate-500 mb-6">Client contact scheduled for next due date.</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-xs font-bold text-slate-400">Email Channel</span>
                                <span className="text-sm font-bold text-slate-900">Active Scan</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">New Reminder Rule</h3>
                            <p className="text-sm text-slate-500 mb-8">Set up an automated email reminder for your invoices.</p>

                            <form onSubmit={async (e: any) => {
                                e.preventDefault();
                                setLoading(true);
                                const formData = new FormData(e.target);
                                const newRule = {
                                    user_id: user?.id,
                                    trigger_type: formData.get('trigger_type'),
                                    days_offset: parseInt(formData.get('days_offset') as string),
                                    channel: 'email',
                                    is_active: true
                                };

                                const { data, error } = await supabase.from('reminder_rules').insert(newRule).select().single();
                                if (!error && data) {
                                    setRules([...rules, data].sort((a, b) => a.days_offset - b.days_offset));
                                    setIsModalOpen(false);
                                }
                                setLoading(false);
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Time</label>
                                    <select name="trigger_type" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700">
                                        <option value="before_due">Before Due Date</option>
                                        <option value="on_due">On Due Date</option>
                                        <option value="after_due">After Due Date</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Offset</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            name="days_offset"
                                            defaultValue={3}
                                            className="w-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-center"
                                        />
                                        <span className="text-sm font-bold text-slate-500">Days</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Rule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersPage;
