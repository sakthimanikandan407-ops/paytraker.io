import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Clock,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';


const Sidebar = () => {
    const { signOut, user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Clients', path: '/dashboard/clients' },
        { icon: FileText, label: 'Invoices', path: '/dashboard/invoices' },
        { icon: Clock, label: 'Reminders', path: '/dashboard/reminders' },
        { icon: BarChart3, label: 'Reports', path: '/dashboard/reports' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-white/5 flex flex-col z-30">
            <div className="p-8">
                <NavLink to="/" className="text-2xl font-black text-white tracking-tighter">
                    PayTrack<span className="text-indigo-400">.io</span>
                </NavLink>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
              ${isActive
                                ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                                : 'text-slate-500 hover:bg-white/5 hover:text-white'}
            `}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className="transition-colors" />
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4 group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                            {user?.user_metadata?.full_name || 'Elite User'}
                        </p>
                        <p className="text-[10px] text-indigo-400 truncate uppercase tracking-widest font-black">
                            Pro Active
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
