import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
            
            <Sidebar />
            <div className="pl-64 relative z-10">
                <Topbar title={pageTitle} />
                <main className="pt-24 pb-12 px-8">
                    <div className="max-w-7xl mx-auto text-white">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Bar (Placeholder for now) */}
            <div className="md:hidden fixed bottom-1 left-1 right-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 flex justify-between items-center z-50 rounded-2xl">
                {/* Mobile icons would go here */}
            </div>
        </div>
    );
};

export default DashboardLayout;
