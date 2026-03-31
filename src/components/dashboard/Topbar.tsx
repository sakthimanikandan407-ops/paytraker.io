import React from 'react';
import { Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
    title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 right-0 left-64 h-20 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 z-20 flex items-center justify-between px-10">
            <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>

            <div className="flex items-center gap-6">
                <div className="relative hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices, clients..."
                        className="pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all w-80 placeholder:text-slate-600 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 cursor-pointer hover:bg-white/10 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
                    <Globe size={16} className="text-indigo-400" />
                    <span>USD</span>
                    <ChevronDown size={14} className="opacity-50" />
                </div>

                <button className="relative p-2.5 text-slate-400 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 group">
                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                </button>

                <div className="h-8 w-[1px] bg-white/5 mx-2"></div>

                <div className="flex items-center gap-3 cursor-pointer group px-2 py-1 rounde-xl hover:bg-white/5 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-400 font-black text-sm">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
