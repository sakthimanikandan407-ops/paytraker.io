import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Mail, Phone, Building2, Globe, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Client } from '../../types/database';
import Modal from '../../components/ui/Modal';

const ClientCard = ({ client }: { client: Client }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {client.name.charAt(0)}
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical size={20} />
            </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{client.name}</h3>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
            <Building2 size={14} />
            {client.company || 'Individual'}
        </p>

        <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="truncate">{client.email}</span>
            </div>
            {client.phone && (
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span>{client.phone}</span>
                </div>
            )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <Globe size={12} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{client.currency}</span>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:underline">View History</button>
        </div>
    </div>
);

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        currency: 'USD',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
    }, [user]);

    const fetchClients = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setClients(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitLoading(true);

        const { error } = await supabase
            .from('clients')
            .insert([{
                user_id: user.id,
                ...formData
            }]);

        if (!error) {
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', company: '', address: '', currency: 'USD', notes: '' });
            fetchClients();
        }
        setSubmitLoading(false);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 py-3 px-6 shadow-indigo-100 shadow-xl w-full sm:w-auto"
                >
                    <Plus size={20} />
                    <span>Add Client</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No clients found</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {searchTerm ? 'No clients match your search criteria.' : 'Start by adding your first client to create invoices and track payments.'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary py-3 px-8 mx-auto flex items-center gap-2"
                        >
                            <Plus size={20} /> Add Your First Client
                        </button>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Client"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Client Name*</label>
                            <input
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email*</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                            <input
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                            <input
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-100 outline-none"
                                placeholder="Acme Inc."
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                            <div className="flex gap-2">
                                {['USD', 'INR'].map(curr => (
                                    <button
                                        key={curr}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, currency: curr })}
                                        className={`flex-1 py-2.5 rounded-xl border font-bold transition-all ${formData.currency === curr
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {curr === 'USD' ? '🇺🇸 USD' : '🇮🇳 INR'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50"
                    >
                        {submitLoading ? 'Saving...' : 'Save Client →'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ClientsPage;
