import { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowRight, ArrowLeft, Check, Search, FileText } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import type { Client, InvoiceItem } from '../../types/database';

interface CreateInvoiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');

    // Invoice State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [invoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);

    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');

    // Line Items State
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([
        { description: '', quantity: 1, rate: 0, amount: 0 }
    ]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*');
        if (data) setClients(data);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'rate') {
            item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const calculateTax = () => calculateSubtotal() * (taxRate / 100);
    const calculateTotal = () => calculateSubtotal() + calculateTax();

    const handleCreate = async (sendAfterCreate = false) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Create Invoice
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                client_id: selectedClientId,
                invoice_number: invoiceNumber,
                issue_date: issueDate,
                due_date: dueDate,
                currency,
                subtotal: calculateSubtotal(),
                tax_rate: taxRate,
                tax_amount: calculateTax(),
                total: calculateTotal(),
                notes: notes,
                status: sendAfterCreate ? 'sent' : 'draft'
            })
            .select()
            .single();

        if (invError) {
            alert(invError.message);
            setLoading(false);
            return;
        }

        // 2. Create Items
        const itemsToInsert = items.map((item, index) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            sort_order: index
        }));

        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);

        if (itemsError) {
            alert(itemsError.message);
        } else {
            if (sendAfterCreate) {
                const { sendInvoiceNotification } = await import('../../lib/emailService');
                await sendInvoiceNotification(invoice.id);
            }
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

    return (
        <div className="space-y-10">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-10 px-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all shadow-xl ${step >= s ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-white/5 text-slate-500 border border-white/10'
                            }`}>
                            {step > s ? <Check size={18} /> : s}
                        </div>
                        {s < 3 && <div className={`w-20 h-1 mx-3 rounded-full ${step > s ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white/5'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-5">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Beneficiary*</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                placeholder="Search client database..."
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => {
                                        setSelectedClientId(client.id);
                                        setCurrency(client.currency as any);
                                        setTaxRate(client.currency === 'INR' ? 18 : 0);
                                    }}
                                    className={`p-4 text-left rounded-2xl border transition-all text-sm font-black uppercase tracking-tight ${selectedClientId === client.id
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {client.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Invoice Identity</label>
                            <input
                                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-400 font-black tracking-widest cursor-not-allowed"
                                value={invoiceNumber}
                                disabled
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Base Currency</label>
                            <div className="flex gap-3">
                                {['USD', 'INR'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCurrency(c as any)}
                                        className={`flex-1 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${currency === c ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Issue Date</label>
                            <input
                                type="date"
                                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all color-scheme-dark"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Expiration Date</label>
                            <input
                                type="date"
                                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all color-scheme-dark"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-3 text-right">Rate</div>
                            <div className="col-span-1"></div>
                        </div>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 group">
                                    <div className="col-span-6">
                                        <input
                                            placeholder="Service or product details..."
                                            className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/10 text-white outline-none transition-all placeholder:text-slate-600 font-medium"
                                            value={item.description}
                                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/10 text-white text-center outline-none transition-all font-black"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:bg-white/10 text-white text-right outline-none transition-all font-black"
                                            value={item.rate}
                                            onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <button
                                            onClick={() => removeItem(idx)}
                                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addItem}
                            className="w-full py-5 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                        >
                            <Plus size={18} /> Append Ledger Item
                        </button>
                    </div>

                    <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl">
                        <div className="flex justify-between text-sm font-bold text-slate-400 tracking-tight">
                            <span className="uppercase text-[10px] font-black tracking-widest">Base Assessment</span>
                            <span className="text-white">
                                {currency === 'INR' ? '₹' : '$'}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-400 tracking-tight">
                            <div className="flex items-center gap-4">
                                <span className="uppercase text-[10px] font-black tracking-widest">Fiscal Surcharge (%)</span>
                                <input
                                    type="number"
                                    className="w-16 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-center font-black text-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                />
                            </div>
                            <span className="text-white">
                                {currency === 'INR' ? '₹' : '$'}{calculateTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-white/10">
                            <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Total Valuation</span>
                            <span className="text-3xl font-black text-white tracking-tighter shadow-indigo-500/20 drop-shadow-2xl">
                                {currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="text-center p-10 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl shadow-indigo-600/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 relative z-10 transform -rotate-3 group-hover:rotate-0 transition-transform">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight relative z-10">Finalize Transaction</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2 relative z-10 uppercase tracking-widest">Archiving Document #{invoiceNumber}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm px-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Beneificary</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{clients.find(c => c.id === selectedClientId)?.name}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Expiriation</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{dueDate}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ledger Items</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{items.length} Units</p>
                        </div>
                        <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/20">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Liability</p>
                            <p className="font-black text-indigo-400 text-2xl tracking-tighter">
                                {currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 space-y-4">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Administrative Notes (Optional)</label>
                        <textarea
                            placeholder="Specify payment protocols, bank coordinates, or additional terms..."
                            className="w-full px-6 py-5 rounded-[2rem] border border-white/10 bg-white/5 text-slate-300 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 text-sm h-32 resize-none transition-all outline-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">This data will be permanently recorded on the generated document.</p>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-4 pt-10 px-6">
                {step > 1 && (
                    <button
                        disabled={loading}
                        onClick={() => setStep(step - 1)}
                        className="flex-1 py-5 px-8 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black hover:bg-white/10 hover:text-white flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs"
                    >
                        <ArrowLeft size={18} /> Revert
                    </button>
                )}
                {step < 3 ? (
                    <button
                        disabled={!selectedClientId}
                        onClick={() => setStep(step + 1)}
                        className="flex-[2] py-5 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                        Proceed <ArrowRight size={18} />
                    </button>
                ) : (
                    <div className="flex-[2] flex gap-4">
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(false)}
                            className="flex-1 py-5 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
                        >
                            {loading ? '...' : 'Draft Memo'}
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(true)}
                            className="flex-[2] py-5 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {loading ? 'Transmitting...' : 'Commit & Sync ✓'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
