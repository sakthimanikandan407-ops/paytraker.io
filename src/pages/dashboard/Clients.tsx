import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Mail, Phone, Building2, Globe, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Client } from '../../types/database';
import Modal from '../../components/ui/Modal';
import { useSearch } from '../../contexts/SearchContext';

const ClientCard = ({ client, onView }: { client: Client, onView: () => void }) => (
    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl hover:shadow-indigo-500/10 hover:bg-white/10 transition-all group overflow-hidden relative">
        <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl group-hover:scale-110 transition-transform">
                {client.name.charAt(0)}
            </div>
            <button className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
                <MoreVertical size={20} />
            </button>
        </div>

        <h3 className="text-xl font-black text-white mb-2 truncate group-hover:text-indigo-400 transition-colors">{client.name}</h3>
        <p className="text-sm text-slate-500 mb-8 flex items-center gap-2 font-medium">
            <Building2 size={16} className="text-indigo-500/50" />
            {client.company || 'Private Individual'}
        </p>

        <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                    <Mail size={16} className="text-slate-500" />
                </div>
                <span className="truncate">{client.email}</span>
            </div>
            {client.phone && (
                <div className="flex items-center gap-4 text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <Phone size={16} className="text-slate-500" />
                    </div>
                    <span>{client.phone}</span>
                </div>
            )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <Globe size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{client.currency}</span>
            </div>
            <button 
                onClick={onView}
                className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Client Details →</button>
        </div>
    </div>
);

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { user } = useAuth();

    // Form State
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

    const { searchQuery } = useSearch();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Clients</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 py-4 px-8 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto uppercase tracking-widest text-sm"
                >
                    <Plus size={20} />
                    <span>Add Client</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] border border-white/10 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredClients.map(client => (
                        <ClientCard 
                            key={client.id} 
                            client={client} 
                            onView={() => setSelectedClient(client)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-xl p-24 rounded-[3rem] border border-white/5 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 mx-auto mb-8 border border-indigo-500/20 shadow-xl">
                        <Users size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">No clients yet</h3>
                    <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">
                        Add your first client to start creating invoices and tracking payments automatically.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 py-4 px-10 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all mx-auto uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} /> Add Client
                    </button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Client"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Client Name</label>
                            <input
                                required
                                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="E.g. Acme Corp"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="client@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Phone Number</label>
                            <input
                                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Company (Optional)</label>
                            <input
                                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="Acme International"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Preferred Currency</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['USD', 'INR'].map(curr => (
                                    <button
                                        key={curr}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, currency: curr })}
                                        className={`py-4 rounded-xl border font-black transition-all uppercase tracking-widest text-xs ${formData.currency === curr
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {curr === 'USD' ? '🇺🇸 Dollar (USD)' : '🇮🇳 Rupee (INR)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm mt-4"
                    >
                        {submitLoading ? 'Adding Client...' : 'Add Client →'}
                    </button>
                </form>
            </Modal>
            <Modal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                title="Client Protocol Identity"
            >
                {selectedClient && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-6 p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-500/10 shadow-2xl">
                            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-3xl font-black text-indigo-600 shadow-2xl transform shadow-indigo-500/20">
                                {selectedClient.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{selectedClient.name}</h3>
                                <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mt-1">{selectedClient.company || 'Private Protocol'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Mail size={14} /> Communication Hub
                                </p>
                                <p className="text-sm font-bold text-white truncate">{selectedClient.email}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Phone size={14} /> Voice Uplink
                                </p>
                                <p className="text-sm font-bold text-white">{selectedClient.phone || 'N/A'}</p>
                            </div>
                            <div className="col-span-2 bg-white/5 p-6 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Building2 size={14} /> Protocol Headquarters
                                </p>
                                <p className="text-sm font-bold text-white leading-relaxed">{selectedClient.address || 'Deployment Address Not Specified'}</p>
                            </div>
                        </div>

                        {selectedClient.notes && (
                            <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol Intelligence</p>
                                <p className="text-sm text-slate-400 italic font-medium leading-relaxed">"{selectedClient.notes}"</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                            >
                                Close Archive
                            </button>
                            <button 
                                onClick={() => {
                                    if(confirm('Terminate client protocol? All associated logs will be archived.')) {
                                        supabase.from('clients').delete().eq('id', selectedClient.id).then(() => {
                                            setSelectedClient(null);
                                            fetchClients();
                                        });
                                    }
                                }}
                                className="flex-1 py-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest text-xs"
                            >
                                Terminate Client
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClientsPage;
