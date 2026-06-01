import React from 'react';
import { FileText, Download, Send, X } from 'lucide-react';
import type { Invoice, Client, Profile, InvoiceItem } from '../../types/database';
import { formatCurrency } from '../../lib/currency';

interface InvoicePreviewProps {
    invoice: Invoice & { clients: Client, invoice_items?: InvoiceItem[] };
    profile: Profile | null;
    onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, profile, onClose }) => {
    const subtotal = invoice.subtotal || 0;
    const taxAmount = invoice.tax_amount || 0;
    const total = invoice.total || 0;

    return (
        <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-w-4xl mx-auto">
            {/* Header / Brand */}
            <div className="p-12 bg-indigo-600/10 border-b border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-0" />
                
                <div className="relative z-10 space-y-4">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-3 transform -rotate-3 hover:rotate-0 transition-all overflow-hidden">
                        {profile?.logo_url ? (
                            <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <FileText size={48} className="text-indigo-600" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">{profile?.company_name || profile?.full_name || 'Brand Identity'}</h2>
                        <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">{profile?.gst_number ? `GST: ${profile.gst_number}` : 'Certified Professional'}</p>
                    </div>
                </div>

                <div className="relative z-10 text-right space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter opacity-10 absolute -top-4 -right-2 hidden lg:block">INVOICE</h1>
                    <div className="pt-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Invoice Reference</p>
                        <p className="text-xl font-black text-white tracking-widest">{invoice.invoice_number}</p>
                    </div>
                    <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        Status: {invoice.status}
                    </div>
                </div>
                
                <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-12">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Client Details</h4>
                        <p className="text-lg font-black text-white uppercase tracking-tight">{invoice.clients?.name}</p>
                        <p className="text-sm text-slate-400 font-medium">{invoice.clients?.email}</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Date Schedule</h4>
                        <div className="flex gap-10">
                            <div>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Issued</p>
                                <p className="text-sm font-black text-slate-300">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Due Date</p>
                                <p className="text-sm font-black text-slate-300">{new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/5 h-fit">
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                        <span className="font-bold">{formatCurrency(subtotal, invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Tax ({invoice.tax_rate}%)</span>
                        <span className="font-bold">{formatCurrency(taxAmount, invoice.currency)}</span>
                    </div>
                    <div className="h-[1px] bg-white/10 my-4"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Liability</span>
                        <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(total, invoice.currency)}</span>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
                <div className="px-12 pb-12">
                    <div className="p-8 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Protocol Notes</h4>
                        <p className="text-sm text-slate-400 leading-relaxed italic">"{invoice.notes}"</p>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                <button className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/20">
                    <Download size={18} /> Download Archive
                </button>
                <button className="flex-1 py-4 px-6 rounded-2xl bg-white/10 text-white border border-white/10 font-black hover:bg-white/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <Send size={18} /> Transmit Copy
                </button>
            </div>
        </div>
    );
};

export default InvoicePreview;
