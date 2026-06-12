import { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowRight, ArrowLeft, Check, Search, Upload, Edit, X, Loader2 } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import type { Client, InvoiceItem, Profile } from '../../types/database';

interface CreateInvoiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [profile, setProfile] = useState<Profile | null>(null);

    // Invoice State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [invoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);

    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');
    const [autoSend, setAutoSend] = useState(true);

    // Step 3 Freelancer Identity Editing States
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [editingCompanyName, setEditingCompanyName] = useState(false);
    const [companyNameInput, setCompanyNameInput] = useState('');

    // Line Items State
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([
        { description: '', quantity: 1, rate: 0, amount: 0 }
    ]);

    useEffect(() => {
        fetchClients();
        fetchProfile();
    }, []);

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*');
        if (data) setClients(data);
    };

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                setProfile(data);
                setCompanyNameInput(data.company_name || '');
            }
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingLogo(true);
            const file = e.target.files?.[0];
            const { data: { user } } = await supabase.auth.getUser();
            if (!file || !user) return;

            if (file.size > 2 * 1024 * 1024) {
                alert('File too large (Max 2MB)');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ logo_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile(prev => prev ? { ...prev, logo_url: publicUrl } : null);
        } catch (error: any) {
            console.error('Logo upload failed:', error);
            alert('Logo upload failed: ' + (error.message || 'Unknown error'));
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleCompanyNameSave = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({ company_name: companyNameInput })
                .eq('id', user.id);

            if (error) throw error;

            setProfile(prev => prev ? { ...prev, company_name: companyNameInput } : null);
            setEditingCompanyName(false);
        } catch (error: any) {
            console.error('Saving company name failed:', error);
            alert('Failed to save company name: ' + (error.message || 'Unknown error'));
        }
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
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            /*
            // Check plan limits
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            const currentPlan = profileData?.plan || 'free';

            if (currentPlan === 'free' || currentPlan === 'starter') {
                const limit = currentPlan === 'free' ? 15 : 50;
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                
                const { count, error: countError } = await supabase
                    .from('invoices')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', startOfMonth);

                if (countError) throw countError;

                if (count !== null && count >= limit) {
                    alert(`You have reached the monthly invoice limit (${limit} invoices/month) for the ${currentPlan === 'free' ? 'Solo (Free)' : 'Starter'} plan. Please upgrade your plan in the Billing portal.`);
                    setLoading(false);
                    return;
                }
            }
            */

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
        } catch (err: any) {
            console.error('Error enforcing invoice limits:', err);
            alert(err.message || 'An error occurred while creating invoice.');
        } finally {
            setLoading(false);
        }
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
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Client*</label>
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
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Invoice Number</label>
                            <input
                                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-400 font-black tracking-widest cursor-not-allowed"
                                value={invoiceNumber}
                                disabled
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Currency</label>
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
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Due Date</label>
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
                            <Plus size={18} /> Add Item
                        </button>
                    </div>

                    <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl">
                        <div className="flex justify-between text-sm font-bold text-slate-400 tracking-tight">
                            <span className="uppercase text-[10px] font-black tracking-widest">Subtotal</span>
                            <span className="text-white">
                                {currency === 'INR' ? '₹' : '$'}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-400 tracking-tight">
                            <div className="flex items-center gap-4">
                                <span className="uppercase text-[10px] font-black tracking-widest">Tax (%)</span>
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
                            <span className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px]">Total Amount</span>
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
                        
                        {/* Interactive Logo upload */}
                        <div className="relative min-w-[96px] max-w-[200px] h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 z-10 transform -rotate-3 hover:rotate-0 transition-all overflow-hidden p-2 group/logo cursor-pointer">
                            {uploadingLogo ? (
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            ) : profile?.logo_url ? (
                                <img src={profile.logo_url} alt="Company Logo" className="max-w-full max-h-full w-auto h-auto object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 px-4">
                                    <Upload size={24} />
                                    <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-center whitespace-nowrap">Add Logo</span>
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <label className="absolute inset-0 bg-indigo-600/80 cursor-pointer flex flex-col items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200">
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                                <Upload size={18} />
                                <span className="text-[8px] font-black uppercase tracking-wider mt-1 whitespace-nowrap">Upload</span>
                            </label>
                        </div>

                        {/* Editable Company/Freelancer Name */}
                        <div className="relative z-10 flex items-center justify-center gap-2 max-w-md mx-auto min-h-[40px]">
                            {editingCompanyName ? (
                                <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1">
                                    <input
                                        type="text"
                                        className="bg-transparent text-white text-lg font-black tracking-tight outline-none w-48 text-center"
                                        value={companyNameInput}
                                        onChange={(e) => setCompanyNameInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCompanyNameSave()}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleCompanyNameSave}
                                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCompanyNameInput(profile?.company_name || '');
                                            setEditingCompanyName(false);
                                        }}
                                        className="text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group/name cursor-pointer py-1 px-3 hover:bg-white/5 rounded-xl transition-colors" onClick={() => setEditingCompanyName(true)}>
                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                        {profile?.company_name || 'Your Company Name'}
                                    </h3>
                                    <Edit size={16} className="text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity hover:text-white" />
                                </div>
                            )}
                        </div>

                        <p className="text-sm font-bold text-slate-400 mt-2 relative z-10 uppercase tracking-widest">Creating Invoice #{invoiceNumber}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm px-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Client</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{clients.find(c => c.id === selectedClientId)?.name}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Due Date</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{dueDate}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ledger Items</p>
                            <p className="font-black text-white text-lg tracking-tight uppercase">{items.length} Units</p>
                        </div>
                        <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/20">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Amount</p>
                            <p className="font-black text-indigo-400 text-2xl tracking-tighter">
                                {currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 space-y-6">
                        <div className="flex items-center justify-between p-6 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">Auto-send reminders</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">Escalating emails until paid</p>
                            </div>
                            <button 
                                onClick={() => setAutoSend(!autoSend)}
                                className={`w-12 h-6 rounded-full transition-all relative ${autoSend ? 'bg-indigo-600' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoSend ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Notes</label>
                            <textarea
                                placeholder="Add any extra notes for the client..."
                                className="w-full px-6 py-5 rounded-[2rem] border border-white/10 bg-white/5 text-slate-300 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 text-sm h-32 resize-none transition-all outline-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
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
                        <ArrowLeft size={18} /> Back
                    </button>
                )}
                {step < 3 ? (
                    <button
                        disabled={!selectedClientId}
                        onClick={() => setStep(step + 1)}
                        className="flex-[2] py-5 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                        Next <ArrowRight size={18} />
                    </button>
                ) : (
                    <div className="flex-[2] flex gap-4">
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(false)}
                            className="flex-1 py-5 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest text-[10px]"
                        >
                            {loading ? '...' : 'Save Draft'}
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleCreate(autoSend)}
                            className="flex-[2] py-5 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {loading ? 'Sending...' : 'Send Invoice →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
