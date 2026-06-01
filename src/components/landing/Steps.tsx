import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Send, CheckCircle2, ChevronRight, DollarSign, ArrowRight } from 'lucide-react';

const stepsData = [
  {
    number: '01',
    title: 'Input Client Details & Brand',
    description: 'Add your professional details, client contacts, and choose your preferred settlement currency (INR/USD). Upload your custom brand logo in seconds.',
    icon: UserCheck,
    color: 'from-indigo-500 to-violet-500',
    shadow: 'shadow-indigo-500/20 animate-pulse',
  },
  {
    number: '02',
    title: 'Auto-Pilot Escapes Friction',
    description: 'PayTrack tracks invoice progress automatically. As the due date approaches, gentle reminder email cycles kick in on a smart, professional cadence.',
    icon: Send,
    color: 'from-violet-500 to-fuchsia-500',
    shadow: 'shadow-violet-500/20 animate-pulse',
  },
  {
    number: '03',
    title: 'Direct Instant Settlement',
    description: 'Clients clear payments securely with their preferred method. Settlement reaches your local bank account swiftly at flat pricing with zero commission cuts.',
    icon: DollarSign,
    color: 'from-fuchsia-500 to-emerald-500',
    shadow: 'shadow-emerald-500/20 animate-pulse',
  },
];

const Steps = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
            📈 Simple Pipeline
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Three Steps to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Financial Freedom</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Spend less time chasing unpaid balances and more time scaling your freelance business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center max-w-6xl mx-auto">
          {/* Timeline side */}
          <div className="lg:col-span-5 space-y-6">
            {stepsData.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative group ${
                    isActive
                      ? 'bg-white/5 border-white/10 shadow-xl'
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                  }`}
                >
                  <div className="flex gap-5 items-start">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg ' + step.shadow
                          : 'bg-white/5 border-white/5 text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{step.number}</span>
                        <h3 className="text-lg font-black text-white tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive display side */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-3 shadow-2xl relative">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl -z-10 animate-pulse" />
              
              <div className="bg-slate-950 rounded-[2.5rem] p-8 md:p-10 border border-white/5 overflow-hidden relative aspect-[4/3] flex flex-col justify-between">
                
                {/* Simulated App Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">P</div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">PayTrack Flow Workspace</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  </div>
                </div>

                {/* Animated dynamic content inside preview mockup */}
                <div className="flex-grow flex items-center justify-center py-6 relative">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                            NEW INVOICE
                          </span>
                          <span className="text-xs font-bold text-slate-500">Draft Status</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Client Name</label>
                            <div className="bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold text-white">
                              DevScale Software Solutions
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Amount</label>
                              <div className="bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold text-white">
                                ₹1,85,000
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Due Date</label>
                              <div className="bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold text-white">
                                Net 15 Days
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] text-indigo-400 font-bold">GST</div>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center">Auto-populate 18% SGST/CGST rules</span>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">
                              Escalation Active
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">Smart Cadence</span>
                        </div>
                        <div className="bg-slate-950 border border-white/5 p-4 rounded-xl space-y-2.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-wider pb-2 border-b border-white/5">
                            <span>To: client@devscale.in</span>
                            <span>Cadence: Day -3</span>
                          </div>
                          <h4 className="text-xs font-black text-white">Friendly Reminder: Upcoming Invoice Settlement</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                            Hello Team, this is a quick friendly reminder that Invoice #INV-2026-004 is upcoming in 3 days. Settlement can be cleared smoothly at your direct client portal link...
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center mt-1">
                          No awkward phone calls or manual tracking required
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                          <CheckCircle2 size={28} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white tracking-tight uppercase">Settlement Received</h3>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Direct Local Transfer Complete</p>
                        </div>
                        <div className="bg-slate-950 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                          <div className="text-left">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Settled Amount</p>
                            <p className="text-base font-black text-white">₹1,85,000</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Platform Take</p>
                            <p className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">₹0 (Flat Subscription)</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                          Funds processed and credited to bank account
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulated App Footer */}
                <div className="flex justify-between items-center border-t border-white/5 pt-5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <span>PayTrack Active Engine</span>
                  <span className="text-indigo-400">Click Steps to view workflow</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Banner */}
        <div className="mt-24 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 hover:bg-white/10 font-black rounded-2xl hover:scale-[1.03] active:scale-95 transition-all text-lg tracking-tight group"
          >
            <span>Explore the Elite Experience</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Steps;
