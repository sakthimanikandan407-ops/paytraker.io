import { CheckCircle2, XCircle, ShieldAlert, ArrowRight, ShieldCheck, DollarSign, Clock, Mail } from 'lucide-react';

const Comparison = () => {
  const comparisonItems = [
    {
      feature: 'Invoice Follow-ups',
      oldWay: {
        text: 'Stressful manual chasing, awkward text messages, and ignored emails.',
        icon: <ShieldAlert className="text-rose-400 shrink-0" size={20} />,
      },
      newWay: {
        text: 'Automated email escalation sequence sent exactly when needed.',
        icon: <Mail className="text-indigo-400 shrink-0" size={20} />,
      },
    },
    {
      feature: 'Processing Costs',
      oldWay: {
        text: 'Traditional platforms taking 3% to 5.4% slice out of your hard-earned revenue.',
        icon: <DollarSign className="text-rose-400 shrink-0" size={20} />,
      },
      newWay: {
        text: 'Flat-rate subscription with 0% platform commission cuts.',
        icon: <ShieldCheck className="text-emerald-400 shrink-0" size={20} />,
      },
    },
    {
      feature: 'Client Payment Experience',
      oldWay: {
        text: 'Messy bank details inside flat PDFs requiring manual copy-pasting.',
        icon: <XCircle className="text-rose-400 shrink-0" size={20} />,
      },
      newWay: {
        text: 'Interactive, elite payment page with UPI, Cards, and direct bank settlement.',
        icon: <CheckCircle2 className="text-indigo-400 shrink-0" size={20} />,
      },
    },
    {
      feature: 'Average Payout Delays',
      oldWay: {
        text: 'Waiting 14 to 30+ days for corporate clients to clear invoices.',
        icon: <Clock className="text-rose-400 shrink-0" size={20} />,
      },
      newWay: {
        text: 'Settled in under 3 days on average through direct automated flow.',
        icon: <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />,
      },
    },
  ];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[130px] -z-10 animate-pulse" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
            ⚡ Platform Contrast
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            The Old Workflow vs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">PayTrack Elite</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            See how PayTrack removes administrative friction to help professional creators protect their time and margins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Traditional Invoicing Card */}
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden transition-all hover:bg-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">The Traditional Mess</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Slow & stressful collections</p>
              </div>
            </div>

            <div className="space-y-6">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                  {item.oldWay.icon}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{item.feature}</h4>
                    <p className="text-sm font-semibold text-slate-300 leading-relaxed">{item.oldWay.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PayTrack Card */}
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-indigo-500/5 border border-indigo-500/30 relative overflow-hidden transition-all shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)] hover:-translate-y-1 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 border border-indigo-500/30 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">PayTrack Automation</h3>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-wider mt-0.5">Fast, professional settlements</p>
              </div>
            </div>

            <div className="space-y-6">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex gap-4 hover:border-indigo-500/40 transition-colors">
                  {item.newWay.icon}
                  <div>
                    <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-1">{item.feature}</h4>
                    <p className="text-sm font-bold text-white leading-relaxed">{item.newWay.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="mt-20 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 hover:scale-[1.03] active:scale-95 transition-all text-lg tracking-tight border border-indigo-500/20 group"
          >
            <span>Switch to PayTrack Today</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
