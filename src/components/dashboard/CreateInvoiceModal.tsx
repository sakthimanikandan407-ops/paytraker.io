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
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {step > s ? <Check size={16} /> : s}
                        </div>
                        {s < 3 && <div className={`w-16 h-1 mx-2 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">Select Client*</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                placeholder="Search clients..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                            {filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => {
                                        setSelectedClientId(client.id);
                                        setCurrency(client.currency as any);
                                        setTaxRate(client.currency === 'INR' ? 18 : 0);
                                    }}
                                    className={`p-3 text-left rounded-xl border transition-all text-sm font-semibold ${selectedClientId === client.id
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    {client.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Invoice #</label>
                            <input
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed"
                                value={invoiceNumber}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                            <div className="flex gap-2">
                                {['USD', 'INR'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCurrency(c as any)}
                                        className={`flex-1 py-2.5 rounded-xl border font-bold text-xs ${currency === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2">Qty</div>
                            <div className="col-span-3">Rate</div>
                            <div className="col-span-1"></div>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-4 group">
                                <div className="col-span-6">
                                    <input
                                        placeholder="Item description..."
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white"
                                        value={item.description}
                                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white text-center"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white text-right"
                                        value={item.rate}
                                        onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <button
                                        onClick={() => removeItem(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addItem}
                            className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                        >
                            <Plus size={16} /> Add Line Item
                        </button>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-bold underline decoration-slate-200">
                                {currency === 'INR' ? '₹' : '$'}{calculateSubtotal().toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <span>Tax Rate (%)</span>
                                <input
                                    type="number"
                                    className="w-12 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                />
                            </div>
                            <span className="font-bold">
                                {currency === 'INR' ? '₹' : '$'}{calculateTax().toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                            <span className="font-bold text-slate-900">Total Due</span>
                            <span className="text-2xl font-bold gradient-heading">
                                {currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="text-center p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 text-indigo-600">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Confirm Invoice Details</h3>
                        <p className="text-sm text-slate-500 mt-2">Ready to create invoice #{invoiceNumber}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm px-4">
                        <div>
                            <p className="text-slate-400 mb-1">Client</p>
                            <p className="font-bold text-slate-800">{clients.find(c => c.id === selectedClientId)?.name}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Due Date</p>
                            <p className="font-bold text-slate-800">{dueDate}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Total Items</p>
                            <p className="font-bold text-slate-800">{items.length}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Amount</p>
                            <p className="font-bold text-slate-900 text-lg">
                                {currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="px-4 pb-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Details / Notes (Optional)</label>
                        <textarea
                            placeholder="e.g. Please send payment via UPI to sakthi@okicici or Bank Acc: 12345678..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm h-24 resize-none transition-colors"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 mt-1">This will be included on the invoice so your client knows how to pay you.</p>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-4 pt-6">
                {step > 1 && (
                    <button
                        disabled={loading}
                        onClick={() => setStep(step - 1)}
                        className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                )}
                {step < 3 ? (
                    <button
                        disabled={!selectedClientId}
                        onClick={() => setStep(step + 1)}
                        className="flex-[2] btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Continue <ArrowRight size={18} />
                    </button>
                ) : (
                    <div className="flex-[2] flex gap-3">
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(false)}
                            className="flex-1 py-4 px-6 rounded-2xl border border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
                        >
                            {loading ? '...' : 'Save Draft'}
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(true)}
                            className="flex-[2] btn-primary py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Save & Send ✓'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
