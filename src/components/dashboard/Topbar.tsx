import React from 'react';
import { Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
    title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 flex items-center justify-between px-8">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>

            <div className="flex items-center gap-6">
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices, clients..."
                        className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all w-64"
                    />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-pointer hover:bg-slate-100 transition-all">
                    <Globe size={16} />
                    <span className="text-sm font-bold">USD</span>
                    <ChevronDown size={14} />
                </div>

                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
