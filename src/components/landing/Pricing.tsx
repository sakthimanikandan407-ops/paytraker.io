import { useState } from 'react';
import { Sparkles, Zap, Shield, Rocket } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  const plans = [
    {
      name: 'Solo',
      icon: <Zap size={24} className="text-indigo-400" />,
      prices: {
        USD: { monthly: 0, annual: 0 },
        INR: { monthly: 0, annual: 0 }
      },
      description: 'Ideal for freelance beginners.',
      features: [
        '5 clients',
        '15 invoices/month',
        'Email reminders',
        'Basic dashboard',
        'PDF export',
        'Basic analytics'
      ],
      cta: 'Get started free',
      highlight: false
    },
    {
      name: 'Starter',
      icon: <Sparkles size={24} className="text-amber-400" />,
      prices: {
        USD: { monthly: 7, annual: 5, billedAt: 60 },
        INR: { monthly: 599, annual: 499, billedAt: 5988 }
      },
      founding: '$4/mo',
      description: 'Standard for professional freelancers.',
      features: [
        '15 clients',
        '50 invoices/month',
        'Smart reminder schedule',
        'Basic analytics',
        'PDF export + logo',
        'INR + USD support',
        '14-day free trial'
      ],
      cta: 'Start free trial',
      highlight: false
    },
    {
      name: 'Pro',
      icon: <Rocket size={24} className="text-violet-400" />,
      prices: {
        USD: { monthly: 15, annual: 12, billedAt: 144 },
        INR: { monthly: 999, annual: 799, billedAt: 9588 }
      },
      founding: '$9/mo',
      description: 'Most powerful tools for growing pros.',
      features: [
        'Unlimited clients',
        'Unlimited invoices',
        'Email + WhatsApp reminders',
        'Smart AI reminder timing',
        'Full revenue analytics',
        'Client payment portal',
        'White-label invoices',
        'GST compliance',
        'Priority support',
      ],
      cta: 'Start free trial',
      highlight: true
    },
    {
      name: 'Studio',
      icon: <Shield size={24} className="text-emerald-400" />,
      prices: {
        USD: { monthly: 35, annual: 28, billedAt: 336 },
        INR: { monthly: 2799, annual: 2299, billedAt: 27588 }
      },
      founding: '$19/mo',
      description: 'Advanced features for small teams.',
      features: [
        'Everything in Pro',
        '10 team members',
        'Custom email domain',
        'Xero + QuickBooks sync',
        'Advanced analytics',
        'API access',
        'Zapier integration',
        'Dedicated account manager',
      ],
      cta: 'Start free trial',
      highlight: false
    }
  ];

  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-2xl">
            🔥 Founding Member Pricing — only 100 spots
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Pricing Tiers</span>
          </h2>

          <div className="flex flex-col items-center gap-8 mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {/* Billing Toggle */}
              <div className="flex items-center p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${!isAnnual ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${isAnnual ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  Yearly <span className="ml-1 opacity-70">(-20%)</span>
                </button>
              </div>

              {/* Currency Switcher */}
              <div className="flex items-center p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  INR (₹)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.prices[currency].annual : plan.prices[currency].monthly;
            const billedAt = plan.prices[currency].billedAt;
            const isFree = price === 0;

            return (
              <div
                key={idx}
                className={`group flex flex-col p-px rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 ${plan.highlight ? 'bg-gradient-to-b from-indigo-400 via-violet-500 to-indigo-600 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)]' : 'bg-white/10'}`}
              >
                <div className={`flex-grow bg-slate-950 rounded-[2.45rem] p-8 border border-white/5 transition-all ${plan.highlight ? 'bg-slate-950/90 shadow-inner' : 'hover:bg-slate-900/50 hover:border-white/10'}`}>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}>
                        {plan.icon}
                      </div>
                      {plan.highlight && (
                        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/20 italic">
                          Peak Choice
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-black text-white tracking-tighter">
                        {isFree ? 'Free' : `${symbol}${price}`}
                      </span>
                      {!isFree && <span className="text-slate-500 font-bold ml-1">/mo</span>}
                    </div>

                    {!isFree && (
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                        {isAnnual ? `Billed ${symbol}${billedAt}/yr` : 'Monthly Billing'}
                      </div>
                    )}

                    {!isFree && !isAnnual && plan.founding && (
                      <div className="mt-4 flex">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-glow">
                          Founding Rate: {plan.founding}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed h-12">
                    {plan.description}
                  </p>

                  <div className="w-full h-px bg-white/5 mb-8" />

                  <ul className="space-y-4 mb-10 overflow-hidden">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs font-bold text-slate-300 group-hover:translate-x-1 transition-transform duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/signup"
                    className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 text-center block ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02]'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:scale-[1.02]'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-20 text-slate-500 text-xs font-bold flex items-center justify-center gap-3">
          <div className="w-10 h-px bg-white/5" />
          Powered by Industry-Standard Encryption & Stripe
          <div className="w-10 h-px bg-white/5" />
        </p>
      </div>
    </section>
  );
};

export default Pricing;
