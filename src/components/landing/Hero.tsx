import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, CheckCircle, ArrowRight, ShieldCheck, Zap, Mail, RefreshCw, Percent } from 'lucide-react';

const Hero = () => {
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Simulator Interactive State
    const [clientName, setClientName] = useState('Acme Agency Co.');
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
    const [invoiceAmount, setInvoiceAmount] = useState<number>(185000);
    const [customAmountStr, setCustomAmountStr] = useState('');
    const [simStep, setSimStep] = useState<'details' | 'reminder' | 'settlement'>('details');

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left - box.width / 2;
        const y = e.clientY - box.top - box.height / 2;
        setTilt({
            x: -(y / (box.height / 2)) * 6,
            y: (x / (box.width / 2)) * 6
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    // Calculate commission loss for traditional gateways (averaging 3.5% for international / local high-tier gateways)
    const commissionLoss = Math.round(invoiceAmount * 0.035);
    const totalSavings = commissionLoss;

    const formattedAmount = currency === 'INR' 
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(invoiceAmount)
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(invoiceAmount);

    const formattedSavings = currency === 'INR'
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalSavings)
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalSavings);

    const presetAmounts = {
        INR: [50000, 185000, 500000],
        USD: [2500, 7500, 25000]
    };

    const handlePresetClick = (val: number) => {
        setInvoiceAmount(val);
        setCustomAmountStr('');
    };

    const handleCustomAmountChange = (valStr: string) => {
        setCustomAmountStr(valStr);
        const parsed = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
            setInvoiceAmount(parsed);
        } else {
            setInvoiceAmount(0);
        }
    };

    const handleCurrencyToggle = (curr: 'INR' | 'USD') => {
        setCurrency(curr);
        setInvoiceAmount(presetAmounts[curr][1]);
        setCustomAmountStr('');
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-36 pb-24 px-6 overflow-hidden bg-slate-950">
            {/* Elegant grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

            {/* Dynamic glowing halos */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-gradient-to-b from-indigo-600/30 to-violet-600/10 rounded-full blur-[140px] opacity-70" />
            <div className="absolute bottom-10 right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] opacity-40 animate-pulse" />
            <div className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] opacity-30" />

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Upper floating pill */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-2xl hover:border-indigo-500/30 transition-all duration-300">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                        THE FUTURE OF FREELANCE BILLING
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.85] uppercase">
                        Get Paid <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-[length:200%_auto] animate-gradient relative">
                            Automatically.
                            <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500/30 via-violet-500/40 to-indigo-500/30 blur-[1px]" />
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 font-semibold leading-relaxed">
                        The sophisticated invoicing platform for professional creators. 
                        Track payments, automate follow-ups, and scale your business with ease.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                        <a href="/signup" className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-[1.03] active:scale-95 transition-all text-lg tracking-tight inline-block border border-indigo-500/20">
                            Start Your Free Journey
                        </a>
                        <button 
                            onClick={() => setIsDemoOpen(true)}
                            className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.03] active:scale-95 transition-all text-lg tracking-tight flex items-center gap-3"
                        >
                            <Play size={18} className="fill-white" />
                            <span>Launch Live Simulator</span>
                        </button>
                    </div>
                </motion.div>

                {/* Interactive 3D Perspective Dashboard Preview card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 55 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="relative max-w-5xl mx-auto cursor-pointer"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsDemoOpen(true)}
                >
                    {/* Left floating micrometer card */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="hidden xl:flex absolute left-[-120px] top-[20%] items-center gap-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-[1.5rem] shadow-2xl hover:border-emerald-500/30 transition-colors z-20"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Invoice Settled</p>
                            <p className="text-xs font-black text-white">₹1,45,000 received</p>
                        </div>
                    </motion.div>

                    {/* Right floating micrometer card */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="hidden xl:flex absolute right-[-120px] bottom-[20%] items-center gap-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-[1.5rem] shadow-2xl hover:border-amber-500/30 transition-colors z-20"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                            <Zap size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auto-Reminded</p>
                            <p className="text-xs font-black text-white">Email flow active</p>
                        </div>
                    </motion.div>

                    {/* Shadow overlay beneath */}
                    <div className="absolute inset-0 bg-indigo-500/25 rounded-[3rem] blur-3xl -z-10 animate-pulse" />
                    
                    {/* Outer border wrapper */}
                    <div 
                        className="bg-slate-900/80 backdrop-blur-2xl rounded-[2.8rem] border border-white/10 p-2.5 shadow-2xl shadow-black overflow-hidden group"
                        style={{
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                            transition: 'transform 0.15s ease-out'
                        }}
                    >
                        <div className="relative bg-slate-950 rounded-[2.3rem] overflow-hidden border border-white/5 aspect-video flex items-center justify-center">
                           <img 
                             src="/dashboard-preview.png" 
                             alt="PayTrack Elite Dashboard" 
                             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-70" />
                           
                           {/* Hover center Play button */}
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                               <div className="w-24 h-24 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 scale-75 group-hover:scale-100 transition-transform duration-500">
                                   <Play size={36} className="fill-white ml-1.5 animate-pulse" />
                               </div>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Fully interactive sandbox simulator modal */}
            <AnimatePresence>
                {isDemoOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDemoOpen(false)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                        />

                        {/* Simulator Card content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                            className="relative max-w-5xl w-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-1 z-10 my-auto"
                        >
                            {/* Simulator header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-950/50">
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck size={20} className="text-indigo-400 animate-pulse" />
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                                        PayTrack Interactive Sandbox & Revenue Calculator
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsDemoOpen(false);
                                        setSimStep('details');
                                    }}
                                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Simulator Interactive Workspace */}
                            <div className="bg-slate-950 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[480px]">
                                
                                {/* Left Column: Inputs & Commission savings calculator */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
                                            1. Configuration Parameters
                                        </h3>
                                        
                                        {/* Client Name Input */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                                Client Name
                                            </label>
                                            <input 
                                                type="text" 
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                placeholder="e.g. Acme Corp"
                                                className="w-full bg-slate-900 border border-white/10 px-4 py-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>

                                        {/* Currency Picker */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                                Invoice Currency
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-white/5">
                                                <button
                                                    onClick={() => handleCurrencyToggle('INR')}
                                                    className={`py-2 text-xs font-black rounded-lg transition-all ${currency === 'INR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    INR (₹)
                                                </button>
                                                <button
                                                    onClick={() => handleCurrencyToggle('USD')}
                                                    className={`py-2 text-xs font-black rounded-lg transition-all ${currency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    USD ($)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Amount Preset buttons */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                                Preset Amounts
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {presetAmounts[currency].map((preset) => {
                                                    const disp = currency === 'INR' ? `₹${preset/1000}k` : `$${preset/1000}k`;
                                                    return (
                                                        <button
                                                            key={preset}
                                                            onClick={() => handlePresetClick(preset)}
                                                            className={`py-2.5 text-[11px] font-black rounded-xl border transition-all ${invoiceAmount === preset ? 'bg-indigo-600/15 border-indigo-500 text-white shadow' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'}`}
                                                        >
                                                            {disp}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Custom Amount input */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                                Or Enter Custom Amount
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                                                    {currency === 'INR' ? '₹' : '$'}
                                                </span>
                                                <input 
                                                    type="text" 
                                                    value={customAmountStr}
                                                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                                                    placeholder={invoiceAmount.toLocaleString()}
                                                    className="w-full bg-slate-900 border border-white/10 pl-8 pr-4 py-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Revenue Calculator */}
                                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                                            <Percent size={14} /> Traditional Processor Loss vs PayTrack
                                        </h4>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between font-bold text-slate-400">
                                                <span>Standard Payout Cut (~3.5%):</span>
                                                <span className="text-rose-400">-{currency === 'INR' ? '₹' : '$'}{commissionLoss.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-slate-400">
                                                <span>PayTrack Platform Cut:</span>
                                                <span className="text-emerald-400">₹0 / $0 Flat</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Single Invoice Savings</span>
                                                <span className="text-sm font-black text-emerald-300 animate-pulse">{formattedSavings}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Active Live Sandbox screen */}
                                <div className="lg:col-span-7 flex flex-col justify-between h-full bg-slate-900/40 border border-white/5 rounded-3xl p-5 md:p-6 relative">
                                    <div className="absolute inset-0 bg-indigo-500/[0.01] rounded-3xl blur-3xl -z-10" />

                                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Simulator Display Screen
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${simStep === 'details' ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                                            <div className={`w-2 h-2 rounded-full ${simStep === 'reminder' ? 'bg-violet-500' : 'bg-slate-700'}`} />
                                            <div className={`w-2 h-2 rounded-full ${simStep === 'settlement' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                        </div>
                                    </div>

                                    {/* Screen Workspace */}
                                    <div className="flex-grow flex items-center justify-center min-h-[300px]">
                                        <AnimatePresence mode="wait">
                                            
                                            {/* Details step screen */}
                                            {simStep === 'details' && (
                                                <motion.div
                                                    key="details"
                                                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                                    className="w-full max-w-md bg-slate-950 border border-white/5 rounded-2xl p-6 space-y-5"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white italic">P</div>
                                                            <div>
                                                                <h4 className="text-xs font-black text-white leading-none">Draft Dispatch</h4>
                                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 inline-block">INV-2026-042</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                            Awaiting Dispatch
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                                                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                                            <span>To Client:</span>
                                                            <span className="text-white font-bold">{clientName}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                                            <span>Total Balance Due:</span>
                                                            <span className="text-white font-black">{formattedAmount}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                                                            <span>Terms:</span>
                                                            <span className="text-white font-bold">Net 15 Days</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setSimStep('reminder')}
                                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                                                    >
                                                        <span>Dispatch & Start Auto-Reminders</span>
                                                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </motion.div>
                                            )}

                                            {/* Reminder step screen */}
                                            {simStep === 'reminder' && (
                                                <motion.div
                                                    key="reminder"
                                                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                                    className="w-full max-w-md bg-slate-950 border border-white/5 rounded-2xl p-6 space-y-5"
                                                >
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={16} className="text-violet-400 animate-bounce" />
                                                            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
                                                                Smart Automated Email
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                                            Cadence: Day -3
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 bg-slate-900 border border-white/5 p-4 rounded-xl text-left">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subject: Upcoming Invoice Settlement Alert</p>
                                                        <p className="text-xs font-black text-white mt-1">Hello Team,</p>
                                                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                                                            This is a quick friendly reminder that Invoice #INV-2026-042 for <span className="text-white font-black">{formattedAmount}</span> is upcoming in 3 days. 
                                                            You can settle this payment securely in under 60 seconds at your direct client portal link.
                                                        </p>
                                                    </div>

                                                    <div className="bg-violet-950/20 border border-violet-500/10 p-3 rounded-xl text-center">
                                                        <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">
                                                            ⏱️ Auto-reminding client without awkward phone calls
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => setSimStep('settlement')}
                                                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 group"
                                                    >
                                                        <span>Simulate Secure Client Settlement</span>
                                                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </motion.div>
                                            )}

                                            {/* Settlement step screen */}
                                            {simStep === 'settlement' && (
                                                <motion.div
                                                    key="settlement"
                                                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                                    className="w-full max-w-md bg-slate-950 border border-white/5 rounded-2xl p-6 text-center space-y-6"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                                                        <CheckCircle size={32} />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">Settlement Verified</h3>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deposited Directly via Dodo Payments</p>
                                                    </div>

                                                    <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex justify-between items-center text-left">
                                                        <div>
                                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Credited Balance</span>
                                                            <p className="text-lg font-black text-white">{formattedAmount}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Commission Cut</span>
                                                            <p className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">₹0 / $0 Flat</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setSimStep('details')}
                                                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                                                        <span>Reset Sandbox Simulator</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Simulator footer action */}
                                    <div className="border-t border-white/5 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] text-center sm:text-left leading-relaxed">
                                            Saves you an average of ₹18,000 / month in commission losses
                                        </span>
                                        <a
                                            href="/signup"
                                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-600/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 group shadow border border-indigo-500/20 shrink-0"
                                        >
                                            <span>Claim Free Account</span>
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Hero;
