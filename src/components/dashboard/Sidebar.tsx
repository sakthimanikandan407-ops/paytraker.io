import React from 'react';
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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-30">
            <div className="p-8">
                <NavLink to="/" className="text-xl font-bold gradient-heading">
                    PAY⚡TRACK
                </NavLink>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl transition-all group
              ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
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

            <div className="p-4 mt-auto border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {user?.user_metadata?.full_name || 'Grow User'}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold">
                            Pro Plan
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
