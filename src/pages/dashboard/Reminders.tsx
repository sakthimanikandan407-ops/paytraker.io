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
        <div className="space-y-12 pb-20">
            {/* Tabs */}
            <div className="flex gap-12 border-b border-white/5">
                {[
                    { id: 'rules', label: 'Protocol Rules', icon: Bell },
                    { id: 'log', label: 'Transmission Log', icon: History },
                    { id: 'scheduled', label: 'Active Queue', icon: Calendar },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'rules' && (
                <div className="space-y-16 animate-in fade-in duration-700">
                    {/* Visual Timeline */}
                    <div className="relative pt-16 pb-32 px-10 overflow-x-auto custom-scrollbar">
                        <div className="absolute top-[80px] left-0 right-0 h-1 bg-white/5 rounded-full -z-10 mx-24 shadow-inner" />

                        <div className="flex justify-between min-w-[900px] relative">
                            {rules.map((rule) => {
                                const isLoading = loadingRules === rule.id;
                                return (
                                    <div key={rule.id} className="flex flex-col items-center group relative">
                                        <div className={`w-14 h-14 rounded-2xl border-2 bg-slate-950 flex items-center justify-center transition-all duration-500 ${rule.is_active ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/5 opacity-40 grayscale'
                                            } ${isLoading ? 'animate-pulse' : ''}`}>
                                            <div className={`w-4 h-4 rounded-full ${rule.is_active ? 'bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] animate-pulse' : 'bg-slate-800'}`} />
                                        </div>

                                        <div className="mt-6 text-center">
                                            <p className={`text-xs font-black uppercase tracking-widest transition-colors ${rule.is_active ? 'text-white' : 'text-slate-600'}`}>
                                                {rule.days_offset} days {rule.trigger_type.replace('_', ' ')}
                                            </p>
                                            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                                <Mail size={12} className={rule.is_active ? 'text-indigo-400' : ''} /> {rule.channel}
                                            </div>
                                        </div>

                                        <div className="absolute top-[90px] opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 bg-slate-900/90 backdrop-blur-3xl p-3 rounded-2xl shadow-2xl border border-white/10 flex gap-2 z-10 shadow-indigo-500/10">
                                            <button
                                                onClick={() => toggleRule(rule.id, rule.is_active)}
                                                className={`p-2 rounded-xl transition-all ${rule.is_active ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                                                title={rule.is_active ? "Deactivate" : "Activate"}
                                            >
                                                <Toggle size={16} className={rule.is_active ? 'rotate-180' : ''} />
                                            </button>
                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                className="p-2 bg-rose-500/5 hover:bg-rose-500/20 rounded-xl text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                                                title="Delete"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 text-slate-600 flex items-center justify-center hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all bg-white/5">
                                    <Plus size={28} />
                                </div>
                                <p className="mt-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">New Rule</p>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-indigo-600/5 p-10 rounded-[2.5rem] border border-indigo-500/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-600/20 transition-all" />
                            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Transmission Engine</h3>
                            <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                                PayTrack's autonomous engine monitors ledgers on a micro-cycle. Based on active protocols,
                                secure notifications are dispatched to beneficiaries to optimize liquidation.
                            </p>
                            <div className="flex flex-wrap gap-6 items-center">
                                <button
                                    onClick={handleRunEngine}
                                    disabled={loading}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-2xl shadow-indigo-600/30 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? 'Initiating...' : 'Sync Now'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                                <div className="text-[10px] font-black text-indigo-400 hover:text-white transition-all cursor-pointer uppercase tracking-[0.2em] border-b border-indigo-400/30 pb-0.5">
                                    Logic Documentation
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5 border border-amber-500/10">
                                    <Bell size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase tracking-tight text-lg">Push Directives</h4>
                                    <p className="text-sm font-medium text-slate-400 mt-1">Deploy browser alerts for protocol status.</p>
                                </div>
                                <button className="px-6 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                                    Enable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'log' && (
                <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-10 py-6">Ledger #</th>
                                    <th className="px-8 py-6">Beneficiary</th>
                                    <th className="px-8 py-6">Protocol Status</th>
                                    <th className="px-8 py-6">Dispatched At</th>
                                    <th className="px-10 py-6 text-right">Channel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => <tr key={i} className="h-20 animate-pulse bg-white/5 border-b border-white/5"><td colSpan={5}></td></tr>)
                                ) : logs.length > 0 ? (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-all group">
                                            <td className="px-10 py-6">
                                                <span className="font-black text-white tracking-widest uppercase text-xs">{log.invoices?.invoice_number}</span>
                                            </td>
                                            <td className="px-8 py-6 font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{log.invoices?.clients?.name}</td>
                                            <td className="px-8 py-6">
                                                {log.status === 'sent' ? (
                                                    <span className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                                                        <CheckCircle2 size={12} /> Dispatched
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-rose-400 font-black uppercase text-[10px] tracking-widest bg-rose-500/5 px-3 py-1.5 rounded-full border border-rose-500/10">
                                                        <AlertCircle size={12} /> Critical Error
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-slate-500 font-bold font-mono text-xs">{new Date(log.sent_at).toLocaleString().toUpperCase()}</td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[9px] font-black text-indigo-400 uppercase tracking-widest group-hover:bg-indigo-500/20 transition-all">{log.channel}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No historical data found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'scheduled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Bypass Rule</button>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 shadow-xl shadow-indigo-500/5">
                                    <Clock size={20} />
                                </div>
                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10">
                                    Production Alpha
                                </div>
                            </div>
                            <h4 className="font-black text-white mb-2 uppercase tracking-tight text-lg">Next Deployment</h4>
                            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Beneficiary sync scheduled for current operational cycle.</p>
                            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Secure Channel</span>
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Active Scan</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-12">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">New Protocol Rule</h3>
                            <p className="text-sm font-medium text-slate-500 mb-10 uppercase tracking-widest">Architect autonomous dispatch logic</p>

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
                            }} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Trigger</label>
                                    <select name="trigger_type" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-white uppercase tracking-widest text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer">
                                        <option value="before_due" className="bg-slate-900">Before Maturity</option>
                                        <option value="on_due" className="bg-slate-900">At Maturity</option>
                                        <option value="after_due" className="bg-slate-900">Post Maturity</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Offset</label>
                                    <div className="flex items-center gap-6">
                                        <input
                                            type="number"
                                            name="days_offset"
                                            defaultValue={3}
                                            className="w-28 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-indigo-400 text-center text-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Operational Days</span>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? 'Committing...' : 'Commit Rule'}
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
