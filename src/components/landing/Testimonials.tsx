import { Star, Quote, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: 'Aarav Mehta',
    role: 'Freelance Full-Stack Developer',
    company: 'DevScale India',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    quote: 'Before PayTrack, I was sending manual reminder emails every weekend. Now, the automated email sequence handles everything. I get paid within 2 days instead of 2 weeks.',
    metrics: '94% paid on time',
    highlight: true,
  },
  {
    name: 'Priya Sharma',
    role: 'UI/UX Consultant',
    company: 'Apex Designs',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    quote: 'The multi-currency support is flawless. I can invoice international clients in USD and local clients in INR. Plus, GST compliance reports are generated with a single click.',
    metrics: '₹4.5L+ invoices automated',
    highlight: false,
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Motion Designer & Creator',
    company: 'Studio Motion',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    quote: 'My clients love the professional PDF invoices and the direct payment portal. PayTrack has completely elevated my brand reputation and eliminated late payment excuses.',
    metrics: '12 days saved / month',
    highlight: false,
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] translate-x-1/3" />
      <div className="absolute bottom-1/3 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
            ✨ Worldwide Validation
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Real Stories from <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Elite Professionals</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Discover how top-tier freelancers and creators use PayTrack to automate their collections and reclaim their time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`group flex flex-col p-px rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 ${
                t.highlight 
                  ? 'bg-gradient-to-b from-indigo-400 via-violet-500 to-indigo-600 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)]' 
                  : 'bg-white/10'
              }`}
            >
              <div className="flex-grow bg-slate-950 rounded-[2.45rem] p-8 md:p-10 border border-white/5 flex flex-col justify-between transition-all hover:bg-slate-900/50">
                <div className="space-y-6">
                  {/* Rating & Quote Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                      <Quote size={18} className="text-indigo-400" />
                    </div>
                  </div>

                  {/* Testimonial text */}
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-semibold italic">
                    "{t.quote}"
                  </p>
                </div>

                {/* Profile detail & metric */}
                <div className="pt-8 border-t border-white/5 mt-8 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-400/50 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{t.name}</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        {t.role}
                      </p>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">
                        {t.company}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Metric */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Verified Impact
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-white uppercase tracking-tight">
                      <span>{t.metrics}</span>
                      <ArrowUpRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Statistics Banner */}
        <div className="mt-24 p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-indigo-950/20 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-around gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">₹15Cr+</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payments Tracked</div>
          </div>
          <div className="w-px h-12 bg-white/5 hidden md:block" />
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">98.2%</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Reminder Success</div>
          </div>
          <div className="w-px h-12 bg-white/5 hidden md:block" />
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">&lt; 3 Days</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Payout Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
