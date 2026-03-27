import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, CalendarClock, Target, ArrowRight } from 'lucide-react';
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
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                    <CalendarClock className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Setup Auto-Billing</h3>
                <p className="text-sm text-slate-500 mt-1">n8n will automatically generate and email invoices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Client & Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Client*</label>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Search clients..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => {
                                        setSelectedClientId(client.id);
                                        setCurrency(client.currency as any);
                                    }}
                                    className={`p-3 text-left rounded-xl border transition-all text-sm font-semibold ${selectedClientId === client.id
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    {client.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Invoice Description*</label>
                        <input
                            placeholder="e.g. Monthly Retainer"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Column: Numbers & Scheduling */}
                <div className="space-y-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Amount</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                                value={subtotal}
                                onChange={(e) => setSubtotal(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tax (%)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Billing Frequency</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['weekly', 'monthly', 'quarterly', 'yearly'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f as any)}
                                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${frequency === f
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Starts On</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                            value={nextIssueDate}
                            onChange={(e) => setNextIssueDate(e.target.value)}
                        />
                    </div>

                    <div className="pt-3 flex justify-between items-center border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-400">TOTAL PER CYCLE</span>
                        <span className="text-xl font-bold text-indigo-600">
                            {currency === 'INR' ? '₹' : '$'}{(subtotal + (subtotal * (taxRate / 100))).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-6 rounded-xl text-slate-500 font-bold hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    disabled={loading || !selectedClientId || !description}
                    className="flex-[2] btn-primary py-3 px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Setting up...' : 'Enable Auto-Billing'}
                    {!loading && <Target size={18} />}
                </button>
            </div>
        </div>
    );
};

export default CreateRecurringInvoiceModal;
