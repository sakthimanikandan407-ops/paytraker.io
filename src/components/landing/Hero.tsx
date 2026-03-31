import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-slate-950">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] opacity-30" />
            
            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-2xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        The Future of Freelance Billing
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                        Get Paid <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">Automatically.</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                        The sophisticated invoicing platform for professional creators. 
                        Track payments, automate follow-ups, and scale your business with ease.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                        <a href="/signup" className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-lg tracking-tight inline-block">
                            Start Your Free Journey
                        </a>
                        <button className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-lg tracking-tight">
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                {/* Dashboard Preview Overlay */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-3xl -z-10 animate-pulse" />
                    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-4 shadow-2xl shadow-black">
                        <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-white/5 aspect-video flex items-center justify-center">
                           <div className="text-center">
                               <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
                               </div>
                               <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Live Dashboard Preview</p>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-slow">
                <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center p-1.5">
                    <div className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
