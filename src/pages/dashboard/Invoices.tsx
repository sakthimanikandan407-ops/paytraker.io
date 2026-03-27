import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Send, CheckCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice, Client } from '../../types/database';
import Modal from '../../components/ui/Modal';
import CreateInvoiceModal from '../../components/dashboard/CreateInvoiceModal';
import CreateRecurringInvoiceModal from '../../components/dashboard/CreateRecurringInvoiceModal';
import { RefreshCw } from 'lucide-react';

import { sendInvoiceNotification } from '../../lib/emailService';

const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        overdue: 'bg-rose-50 text-rose-600 border-rose-100',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        sent: 'bg-blue-50 text-blue-600 border-blue-100',
        draft: 'bg-slate-50 text-slate-500 border-slate-100',
        viewed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.draft}`}>
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
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || inv.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-8">
            {/* Header & Tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex gap-4 border-b border-slate-100">
                        {['all', 'draft', 'sent', 'paid', 'overdue'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-2 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRecurringModalOpen(true)}
                        className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden sm:inline">Auto-Billing</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 py-3 px-6 shadow-indigo-100 shadow-xl"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">New Invoice</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Table Controls */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by invoice # or client..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={18} />
                    </button>
                </div>

                {/* Invoices Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-50">
                                <th className="px-8 py-4">Invoice #</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6 h-16 bg-white"></td>
                                    </tr>
                                ))
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-mono font-bold text-slate-900">{inv.invoice_number}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {inv.clients?.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{inv.clients?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-slate-900">
                                                {inv.currency === 'INR' ? '₹' : '$'}
                                                {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-slate-500">{new Date(inv.due_date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => alert("View PDF feature coming soon!")}
                                                    title="View Invoice"
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSend(inv.id)}
                                                    disabled={processingId === inv.id}
                                                    className={`p-2 rounded-lg border border-transparent transition-all ${processingId === inv.id
                                                        ? 'bg-blue-50 text-blue-400 animate-pulse'
                                                        : 'hover:bg-white hover:border-slate-200 text-slate-400 hover:text-blue-600'
                                                        }`}
                                                >
                                                    <Send size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleMarkPaid(inv.id)}
                                                    title="Mark as Paid"
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-emerald-600 transition-all">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Edit/Delete feature coming soon!")}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                            <Users size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">No invoices found</h3>
                                        <p className="text-slate-400 text-sm">Create your first invoice to start tracking payments.</p>
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
                title="Create Final Invoice"
            >
                <CreateInvoiceModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchInvoices}
                />
            </Modal>

            <Modal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                title=""
            >
                <CreateRecurringInvoiceModal
                    onClose={() => setIsRecurringModalOpen(false)}
                    onSuccess={() => {
                        alert('Auto-billing configured! n8n will process this daily.');
                        fetchInvoices();
                    }}
                />
            </Modal>
        </div>
    );
};

export default InvoicesPage;
