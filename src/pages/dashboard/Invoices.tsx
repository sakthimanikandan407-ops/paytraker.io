import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Eye, Send, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice, Client, Profile, ReminderRule } from '../../types/database';
import Modal from '../../components/ui/Modal';
import CreateInvoiceModal from '../../components/dashboard/CreateInvoiceModal';
import CreateRecurringInvoiceModal from '../../components/dashboard/CreateRecurringInvoiceModal';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/currency';

import { sendInvoiceNotification } from '../../lib/emailService';
import { useSearch } from '../../contexts/SearchContext';
import InvoicePreview from '../../components/dashboard/InvoicePreview';

const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
        overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.1)]',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]',
        sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
        draft: 'bg-white/5 text-slate-400 border-white/10',
        viewed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(129,140,248,0.1)]',
    };

    return (
        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.draft}`}>
            {status === 'sent' ? 'Pending' : status}
        </span>
    );
};

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<(Invoice & { clients: Client })[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rules, setRules] = useState<ReminderRule[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchInvoices();
        fetchRules();
    }, [user]);

    const fetchRules = async () => {
        if (!user) return;
        const { data } = await supabase.from('reminder_rules').select('*').eq('user_id', user.id).eq('is_active', true);
        if (data) setRules(data);
    };

    const fetchInvoices = async () => {
        if (!user) return;
        setLoading(true);

        // Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profileData) setProfile(profileData);

        const { data, error } = await supabase
            .from('invoices')
            .select('*, clients(*)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInvoices(data as (Invoice & { clients: Client })[]);
        }
        setLoading(false);
    };

    const handleSend = async (id: string) => {
        setProcessingId(id);
        const success = await sendInvoiceNotification(id);
        if (success) {
            const { error } = await supabase
                .from('invoices')
                .update({ status: 'sent' })
                .eq('id', id);

            if (!error) {
                setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'sent' } : inv));
            }
        } else {
            alert('Failed to send invoice. Please try again.');
        }
        setProcessingId(null);
    };

    const handleMarkPaid = async (id: string) => {
        const { error } = await supabase
            .from('invoices')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'paid', paid_at: new Date().toISOString() } : inv));
        } else {
            alert('Failed to update status.');
        }
    };

    const calculateNextReminder = (invoice: Invoice) => {
        if (['paid', 'draft', 'cancelled'].includes(invoice.status)) return null;
        
        const dueDate = new Date(invoice.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const possibleDates = rules.map(rule => {
            let target = new Date(dueDate);
            if (rule.trigger_type === 'before_due') {
                target.setDate(dueDate.getDate() - rule.days_offset);
            } else if (rule.trigger_type === 'after_due') {
                target.setDate(dueDate.getDate() + rule.days_offset);
            }
            target.setHours(0, 0, 0, 0);
            return target;
        }).filter(d => d >= today).sort((a, b) => a.getTime() - b.getTime());

        return possibleDates[0] || null;
    };

    const { searchQuery } = useSearch();
    const [selectedInvoice, setSelectedInvoice] = useState<(Invoice & { clients: Client }) | null>(null);

    const filteredInvoices = invoices.filter(inv => {
        const matchesTab = activeTab === 'all' || inv.status === activeTab;
        const matchesSearch = 
            inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.clients?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-10">
            {/* Header & Tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                <div className="space-y-6">
                    <div className="flex gap-8 border-b border-white/5">
                        {['all', 'draft', 'sent', 'paid', 'overdue'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-1 text-sm font-black capitalize transition-all relative tracking-widest ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {tab === 'sent' ? 'pending' : tab}
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <button
                        onClick={() => setIsRecurringModalOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all shadow-xl uppercase tracking-widest text-xs"
                    >
                        <RefreshCw size={18} className="text-indigo-400" />
                        <span>Auto-Billing</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} />
                        <span>New Invoice</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                {/* Table Controls (Search removed as per brief - using global header search) */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between gap-6 bg-white/5">
                    <div className="text-sm font-black text-slate-500 uppercase tracking-widest">
                        {filteredInvoices.length} {filteredInvoices.length === 1 ? 'Invoice' : 'Invoices'} Found
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-10 py-6">Invoice #</th>
                                <th className="px-8 py-6">Client</th>
                                <th className="px-8 py-6">Amount</th>
                                <th className="px-8 py-6">Due Date</th>
                                <th className="px-8 py-6">Next Reminder</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-10 py-8 h-20 bg-white/2"></td>
                                    </tr>
                                ))
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-10 py-6">
                                            <span className="font-black text-white tracking-widest text-sm">{inv.invoice_number}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:scale-110 transition-transform">
                                                    {inv.clients?.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{inv.clients?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-white tracking-tight">
                                                {formatCurrency(inv.total, inv.currency || profile?.default_currency || 'USD')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-slate-500 font-bold">{new Date(inv.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {calculateNextReminder(inv) ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                                                        {calculateNextReminder(inv)?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">Automated</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-700 font-black uppercase tracking-widest">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 transition-all">
                                                    <button 
                                                        onClick={() => setSelectedInvoice(inv)}
                                                        title="View Source"
                                                        className="p-3 rounded-2xl bg-white/10 text-slate-200 border border-white/10 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:scale-110 transition-all shadow-xl shadow-black/20 group/btn">
                                                        <Eye size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSend(inv.id)}
                                                        disabled={processingId === inv.id}
                                                        title="Dispatch Invoice"
                                                        className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 shadow-xl shadow-black/20 group/btn ${processingId === inv.id
                                                            ? 'bg-blue-500/20 text-blue-400 animate-pulse border-blue-500/50'
                                                            : 'bg-white/10 text-slate-200 border-white/10 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                                                            }`}
                                                    >
                                                        <Send size={18} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMarkPaid(inv.id)}
                                                        title="Authorize Payment"
                                                        className="p-3 rounded-2xl bg-white/10 text-slate-200 border border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:scale-110 transition-all shadow-xl shadow-black/20 group/btn">
                                                        <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm('Terminate this invoice record from the distributed ledger?')) {
                                                                supabase.from('invoices').delete().eq('id', inv.id).then(() => fetchInvoices());
                                                            }
                                                        }}
                                                        className="p-3 rounded-2xl bg-white/10 text-slate-200 border border-white/10 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:scale-110 transition-all shadow-xl shadow-black/20"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                        </td>
                                    </tr>
                                ))
                                                         ) : (
                                <tr>
                                    <td colSpan={7} className="px-10 py-24 text-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 mx-auto mb-8 border border-white/5">
                                            <FileText size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-3">No invoices yet</h3>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Create your first invoice and we'll handle the follow-ups automatically.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Invoice"
            >
                <CreateInvoiceModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchInvoices}
                />
            </Modal>

            <Modal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                title="Invoice Preview"
                fullWidth
            >
                {selectedInvoice && (
                    <InvoicePreview 
                        invoice={selectedInvoice} 
                        profile={profile} 
                        onClose={() => setSelectedInvoice(null)} 
                    />
                )}
            </Modal>

            <Modal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                title="Recurring Invoices"
            >
                <CreateRecurringInvoiceModal
                    onClose={() => setIsRecurringModalOpen(false)}
                    onSuccess={() => {
                        alert('Auto-billing protocol engaged. Distributed systems active.');
                        fetchInvoices();
                    }}
                />
            </Modal>
        </div>
    );
};

export default InvoicesPage;
