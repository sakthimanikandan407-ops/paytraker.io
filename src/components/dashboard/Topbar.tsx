import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Search, Globe, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearch } from '../../contexts/SearchContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
    title: string;
}

const Topbar: React.FC<TopbarProps> = ({ title }) => {
    const { user, signOut } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentCurrency, setCurrentCurrency] = useState('USD');
    const [showCurrency, setShowCurrency] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('default_currency')
                .eq('id', user.id)
                .single();
            if (data?.default_currency) {
                setCurrentCurrency(data.default_currency);
            }
        };
        fetchProfile();
    }, [user]);

    const handleCurrencyChange = async (currency: string) => {
        if (!user) return;
        setCurrentCurrency(currency);
        setShowCurrency(false);

        const { error } = await supabase
            .from('profiles')
            .update({ default_currency: currency })
            .eq('id', user.id);

        if (!error) {
            window.location.reload();
        }
    };

    const mockNotifications = [
        { id: 1, title: 'Invoice Paid', desc: 'Client SHURTHI paid Invoice #20260407', time: '2m ago' },
        { id: 2, title: 'New Client', desc: 'Acme Corp added to your protocol', time: '1h ago' },
        { id: 3, title: 'Reminder Sent', desc: 'Automatic reminder for #20260312', time: '3h ago' },
    ];

    return (
        <header className="fixed top-0 right-0 left-64 h-20 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 z-20 flex items-center justify-between px-10">
            <h1 className="text-xl font-black text-white tracking-tight leading-none">{title}</h1>

            <div className="flex items-center gap-6">
                <div className="relative hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search invoices, clients..."
                        className="pl-12 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all w-80 placeholder:text-slate-600 font-medium"
                    />
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowCurrency(!showCurrency)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest ${
                            showCurrency ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Globe size={16} className="text-indigo-400" />
                        <span>{currentCurrency}</span>
                        <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${showCurrency ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showCurrency && (
                            <motion.div 
                                key="currency-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-40 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-30"
                            >
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => handleCurrencyChange('USD')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                                            currentCurrency === 'USD' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span>🇺🇸 USD</span>
                                        <span>$</span>
                                    </button>
                                    <button
                                        onClick={() => handleCurrencyChange('INR')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                                            currentCurrency === 'INR' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span>🇮🇳 INR</span>
                                        <span>₹</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 rounded-xl transition-all border group ${
                            showNotifications ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' : 'text-slate-400 hover:bg-white/5 border-transparent hover:border-white/10'
                        }`}
                    >
                        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                key="notifications-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h4>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">3 New</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {mockNotifications.map(n => (
                                        <div key={n.id} className="p-4 hover:bg-white/5 border-b border-white/5 transition-colors cursor-pointer group">
                                            <p className="text-sm font-bold text-white mb-0.5 group-hover:text-indigo-400 transition-colors">{n.title}</p>
                                            <p className="text-xs text-slate-500 leading-snug">{n.desc}</p>
                                            <span className="text-[10px] text-slate-600 mt-2 block font-medium uppercase tracking-tight">{n.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center bg-white/2">
                                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Clear All Archives</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-[1px] bg-white/5 mx-2"></div>

                <div className="relative">
                    <div 
                        onClick={() => setShowProfile(!showProfile)}
                        className={`flex items-center gap-3 cursor-pointer group px-2 py-1 transition-all rounded-xl ${
                            showProfile ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-indigo-400 font-black text-sm">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <ChevronDown size={14} className={`text-slate-500 group-hover:text-white transition-all ${showProfile ? 'rotate-180 text-white' : ''}`} />
                    </div>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div 
                                key="profile-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl"
                            >
                                <div className="p-4 border-b border-white/5 bg-white/5">
                                    <p className="text-xs font-black text-white uppercase tracking-widest truncate">{user?.email}</p>
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-1">Pro Account</p>
                                </div>
                                <div className="p-2">
                                    <Link 
                                        to="/dashboard/settings" 
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <User size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Profile Identity</span>
                                    </Link>
                                    <Link 
                                        to="/dashboard/settings" 
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <Settings size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Protocol Config</span>
                                    </Link>
                                    <div className="h-[1px] bg-white/5 my-2"></div>
                                    <button 
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
                                    >
                                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
