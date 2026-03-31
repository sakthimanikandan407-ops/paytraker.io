import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, CalendarClock, Target } from 'lucide-react';
import type { Client } from '../../types/database';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateRecurringInvoiceModal = ({ onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');

    const [selectedClientId, setSelectedClientId] = useState('');
    const [description, setDescription] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [nextIssueDate, setNextIssueDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('*');
            if (data) setClients(data);
        };
        fetchClients();
    }, []);

    const handleCreate = async () => {
        if (!selectedClientId || !description || subtotal <= 0) {
            alert('Please fill out all required fields.');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const total = subtotal + (subtotal * (taxRate / 100));

        const { error } = await supabase.from('recurring_invoices').insert({
            user_id: user.id,
            client_id: selectedClientId,
            description,
            frequency,
            next_issue_date: nextIssueDate,
            subtotal,
            tax_rate: taxRate,
            total,
            currency,
            is_active: true
        });

        if (error) {
            alert(error.message);
        } else {
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8 relative group">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl shadow-indigo-600/5 group-hover:scale-110 transition-transform">
                    <CalendarClock className="text-indigo-400" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Auto-Billing Protocol</h3>
                <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">Autonomous n8n ledger synchronization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Client & Details */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Select Beneficiary*</label>
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                placeholder="Search client database..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600 font-medium"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => {
                                        setSelectedClientId(client.id);
                                        setCurrency(client.currency as any);
                                    }}
                                    className={`p-4 text-left rounded-2xl border transition-all text-xs font-black uppercase tracking-tight ${selectedClientId === client.id
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/20'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {client.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Ledger Description*</label>
                        <input
                            placeholder="E.g. Digital Retainer"
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-600 font-black tracking-tight uppercase"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Column: Numbers & Scheduling */}
                <div className="space-y-6 p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Valuation</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-indigo-400 font-black focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                value={subtotal}
                                onChange={(e) => setSubtotal(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Fiscal %</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-indigo-400 font-black focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Transmission Interval</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['weekly', 'monthly', 'quarterly', 'yearly'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f as any)}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-xl ${frequency === f
                                            ? 'bg-white text-slate-900 border-white shadow-white/10'
                                            : 'bg-white/5 text-slate-500 border border-white/10 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Deployment Alpha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none color-scheme-dark"
                            value={nextIssueDate}
                            onChange={(e) => setNextIssueDate(e.target.value)}
                        />
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Liability</span>
                            <span className="text-2xl font-black text-white tracking-tighter shadow-indigo-500/20 drop-shadow-2xl">
                                {currency === 'INR' ? '₹' : '$'}{(subtotal + (subtotal * (taxRate / 100))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-6">
                <button
                    onClick={onClose}
                    className="flex-1 py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all"
                >
                    Abort
                </button>
                <button
                    onClick={handleCreate}
                    disabled={loading || !selectedClientId || !description}
                    className="flex-[2] py-4 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                    {loading ? 'Transmitting Data...' : 'Engage Auto-Billing'}
                    {!loading && <Target size={20} />}
                </button>
            </div>
        </div>
    );
};

export default CreateRecurringInvoiceModal;
