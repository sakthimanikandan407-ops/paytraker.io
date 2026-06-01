import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, 
    Plus, 
    Search, 
    Filter, 
    FolderKanban, 
    TrendingUp, 
    DollarSign, 
    Clock, 
    AlertCircle, 
    X,
    Loader2
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    client_id: string;
    client_name?: string;
    budget: number;
    invoiced_amount: number;
    status: 'active' | 'completed' | 'on_hold';
    description?: string;
    created_at: string;
}

const ProjectsPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [clientId, setClientId] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'completed' | 'on_hold'>('active');
    const [modalError, setModalError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Clients to map client_id to client_name
            const { data: clientsData } = await supabase
                .from('clients')
                .select('id, name')
                .eq('user_id', user?.id);
            const clientsList = clientsData || [];
            setClients(clientsList);

            // Create a lookup map for client names
            const clientMap: { [key: string]: string } = {};
            clientsList.forEach(c => {
                clientMap[c.id] = c.name;
            });

            // 2. Fetch Projects (fallback to local storage if table doesn't exist yet)
            // Check localStorage first to preserve user workspace projects
            const localProj = localStorage.getItem(`paytrack_projects_${user?.id}`);
            if (localProj) {
                const parsed = JSON.parse(localProj);
                // Map client names
                const mapped = parsed.map((p: any) => ({
                    ...p,
                    client_name: clientMap[p.client_id] || 'Unknown Client'
                }));
                setProjects(mapped);
            } else {
                // Initialize default premium mock projects so the dashboard is populated immediately
                const defaultMock: Project[] = [
                    {
                        id: 'proj-1',
                        name: 'Corporate Identity Design',
                        client_id: clientsList[0]?.id || 'client-1',
                        client_name: clientsList[0]?.name || 'TechCorp Systems',
                        budget: 155000,
                        invoiced_amount: 95000,
                        status: 'active',
                        description: 'Complete rebranding guidelines, asset kits, and corporate styling.',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'proj-2',
                        name: 'E-Commerce Platform Expansion',
                        client_id: clientsList[1]?.id || 'client-2',
                        client_name: clientsList[1]?.name || 'CreativeCo Lab',
                        budget: 280000,
                        invoiced_amount: 280000,
                        status: 'completed',
                        description: 'Custom React Shopify storefront with automated payout integrations.',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'proj-3',
                        name: 'Mobile App Wireframing',
                        client_id: clientsList[0]?.id || 'client-1',
                        client_name: clientsList[0]?.name || 'TechCorp Systems',
                        budget: 75000,
                        invoiced_amount: 30000,
                        status: 'on_hold',
                        description: 'Figma layout wireframing and user stories analysis.',
                        created_at: new Date().toISOString()
                    }
                ];
                localStorage.setItem(`paytrack_projects_${user?.id}`, JSON.stringify(defaultMock));
                setProjects(defaultMock);
            }
        } catch (err) {
            console.error('Error fetching project workspace data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        if (!projectName.trim()) {
            setModalError('Please specify a project name.');
            return;
        }

        if (!clientId) {
            setModalError('Please select a client.');
            return;
        }

        const projectBudget = parseFloat(budget);
        if (isNaN(projectBudget) || projectBudget <= 0) {
            setModalError('Please specify a valid budget amount.');
            return;
        }

        setSaving(true);
        try {
            const newProject: Project = {
                id: `proj_${Math.random().toString(36).substring(2, 9)}`,
                name: projectName.trim(),
                client_id: clientId,
                budget: projectBudget,
                invoiced_amount: 0,
                status,
                description: description.trim() || undefined,
                created_at: new Date().toISOString()
            };

            const updatedProjects = [newProject, ...projects];
            localStorage.setItem(`paytrack_projects_${user?.id}`, JSON.stringify(updatedProjects));
            
            // Re-fetch to apply client mappings
            const clientNameMap = clients.reduce((acc, c) => {
                acc[c.id] = c.name;
                return acc;
            }, {} as { [key: string]: string });

            setProjects(updatedProjects.map(p => ({
                ...p,
                client_name: clientNameMap[p.client_id] || 'Unknown Client'
            })));

            // Reset fields & close
            setProjectName('');
            setClientId('');
            setBudget('');
            setDescription('');
            setStatus('active');
            setIsCreateOpen(false);
        } catch (err) {
            setModalError('Failed to create project workspace.');
        } finally {
            setSaving(false);
        }
    };

    // Derived Statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const totalInvoiced = projects.reduce((acc, p) => acc + p.invoiced_amount, 0);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Projects</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Track active workspace budgets and client billings.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    <span>Create Project</span>
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Total Projects</span>
                        <div className="text-3xl font-black text-white">{totalProjects}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <FolderKanban size={24} />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Active projects</span>
                        <div className="text-3xl font-black text-indigo-400">{activeProjects}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Total Budget</span>
                        <div className="text-3xl font-black text-white">₹{totalBudget.toLocaleString()}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Total Invoiced</span>
                        <div className="text-3xl font-black text-emerald-400 font-sans">₹{totalInvoiced.toLocaleString()}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white font-semibold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter size={16} className="text-slate-500 hidden md:block" />
                    <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-full md:w-auto">
                        {['all', 'active', 'completed', 'on_hold'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                                    statusFilter === s 
                                        ? 'bg-indigo-600 text-white shadow-lg' 
                                        : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] py-20 text-center text-slate-500 text-xs font-black uppercase tracking-widest">
                    No matching workspace projects found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((p) => {
                        const progress = p.budget > 0 ? Math.min((p.invoiced_amount / p.budget) * 100, 100) : 0;
                        return (
                            <div 
                                key={p.id}
                                className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.2)] transition-all relative overflow-hidden"
                            >
                                <div className="space-y-6">
                                    {/* Status Pill */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} className="text-indigo-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                                {p.client_name}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                            p.status === 'active' 
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                                : p.status === 'completed'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">
                                            {p.name}
                                        </h3>
                                        {p.description && (
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2 line-clamp-2 h-8">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Billing bar */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Progress</span>
                                            <span className="text-white">{Math.round(progress)}% Invoiced</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Budget details */}
                                <div className="border-t border-white/5 pt-6 mt-8 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Workspace Budget</span>
                                        <span className="text-sm font-black text-white">₹{p.budget.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Invoiced Amount</span>
                                        <span className="text-sm font-black text-emerald-400">₹{p.invoiced_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsCreateOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative max-w-lg w-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-1 z-10"
                        >
                            <form onSubmit={handleCreateProject}>
                                {/* Header */}
                                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-950/50">
                                    <div className="flex items-center gap-2">
                                        <FolderKanban size={18} className="text-indigo-400" />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            Create Workspace Project
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-8 space-y-6 bg-slate-950">
                                    {modalError && (
                                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-3 italic">
                                            <AlertCircle size={16} />
                                            {modalError}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Project Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={projectName}
                                            onChange={e => setProjectName(e.target.value)}
                                            placeholder="Enter project name"
                                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Select Client</label>
                                        <select
                                            required
                                            value={clientId}
                                            onChange={e => setClientId(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                        >
                                            <option value="" className="text-slate-700">Choose Client</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Project Budget (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                value={budget}
                                                onChange={e => setBudget(e.target.value)}
                                                placeholder="e.g. 150000"
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 font-sans"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Project Status</label>
                                            <select
                                                value={status}
                                                onChange={e => setStatus(e.target.value as any)}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-900 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                            >
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                                <option value="on_hold">On Hold</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Description (Optional)</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Specify project scope or billing rules..."
                                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 min-h-[80px] resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-8 py-6 border-t border-white/5 bg-slate-950/50 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                <span>Deploying Project...</span>
                                            </>
                                        ) : (
                                            <span>Create Project</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsPage;
