
const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <span className="text-white font-black text-xl italic leading-none">P</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter">PayTrack<span className="text-indigo-400">.io</span></span>
                </div>
                
                <div className="hidden md:flex items-center gap-10">
                    <a href="#features" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Features</a>
                    <a href="#pricing" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Pricing</a>
                    <a href="#testimonials" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Success Stories</a>
                </div>

                <div className="flex items-center gap-4">
                    <a href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4 py-2">Log in</a>
                    <a href="/signup" className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 text-center">
                        Free Trial
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
