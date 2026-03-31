import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Send, CheckCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice, Client } from '../../types/database';
import Modal from '../../components/ui/Modal';
import CreateInvoiceModal from '../../components/dashboard/CreateInvoiceModal';
import CreateRecurringInvoiceModal from '../../components/dashboard/CreateRecurringInvoiceModal';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import { sendInvoiceNotification } from '../../lib/emailService';

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
            {status}
        </span>
    );
};

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState<(Invoice & { clients: Client })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchInvoices();
    }, [user]);

    const fetchInvoices = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('invoices')
            .select('*, clients(*)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setInvoices(data as any);
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

    const filteredInvoices = invoices.filter(inv => {
        const invoiceNumber = inv.invoice_number || '';
        const clientName = inv.clients?.name || '';
        const matchesSearch = invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || inv.status === activeTab;
        return matchesSearch && matchesTab;
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
                                {tab}
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
                {/* Table Controls */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between gap-6 bg-white/5">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Find by invoice ID or client name..."
                            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 outline-none text-white text-sm transition-all placeholder:text-slate-600 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-3.5 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Invoices Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-8 py-6">Beneficiary</th>
                                <th className="px-8 py-6">Valuation</th>
                                <th className="px-8 py-6">Expirations</th>
                                <th className="px-8 py-6">Lifecycle</th>
                                <th className="px-10 py-6 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-10 py-8 h-20 bg-white/2"></td>
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
                                                {inv.currency === 'INR' ? '₹' : '$'}
                                                {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-slate-500 font-bold">{new Date(inv.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => alert("Digital archive processing...")}
                                                    title="View Source"
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-500 hover:text-white transition-all">
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSend(inv.id)}
                                                    disabled={processingId === inv.id}
                                                    className={`p-2.5 rounded-xl border border-white/5 transition-all ${processingId === inv.id
                                                        ? 'bg-blue-500/10 text-blue-400 animate-pulse'
                                                        : 'bg-white/5 hover:bg-white/10 text-slate-500 hover:text-blue-400'
                                                        }`}
                                                >
                                                    <Send size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleMarkPaid(inv.id)}
                                                    title="Authorize Payment"
                                                    className="p-2.5 bg-white/5 hover:bg-emerald-500/10 rounded-xl border border-white/5 text-slate-500 hover:text-emerald-400 transition-all">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Administrative access restricted")}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-500 hover:text-white transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-10 py-24 text-center">
                                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 mx-auto mb-8 border border-white/5">
                                            <Users size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-3">No Ledger Found</h3>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Initialize your fiscal records by creating your first professional invoice.</p>
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
                title="Initialize Final Invoice"
            >
                <CreateInvoiceModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchInvoices}
                />
            </Modal>

            <Modal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                title="Automated Billing Protocol"
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
