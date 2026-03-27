import React from 'react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <a href="/" className="text-2xl font-bold gradient-heading">
                            PAY⚡TRACK
                        </a>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
                        <a href="#pricing" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
                        <a href="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Login</a>
                        <a href="/signup" className="btn-primary">
                            Start Free →
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
