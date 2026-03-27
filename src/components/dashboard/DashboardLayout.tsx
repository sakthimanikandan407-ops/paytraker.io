import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="pl-64">
                <Topbar title={pageTitle} />
                <main className="pt-24 pb-12 px-8">
                    <div className="max-w-7xl mx-auto text-slate-900">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Bar (Placeholder for now) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center z-50">
                {/* Mobile icons would go here */}
            </div>
        </div>
    );
};

export default DashboardLayout;
