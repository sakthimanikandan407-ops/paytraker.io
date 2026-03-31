import { Zap, Shield, Users, BarChart3, Mail, Globe } from 'lucide-react';

const features = [
    {
        title: 'Auto Reminders',
        description: 'Smart follow-ups that get you paid without the awkward conversations.',
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
    {
        title: 'Payment Tracking',
        description: 'Real-time visibility into every invoice status from draft to deposited.',
        icon: BarChart3,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        title: 'Client Management',
        description: 'Keep your client details, history, and notes organized in one clean place.',
        icon: Users,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
    },
    {
        title: 'Revenue Reports',
        description: 'Beautiful charts that help you understand your growth and collections.',
        icon: Shield,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        title: 'Professional Invoices',
        description: 'Send beautiful PDF invoices that reflect your brand professional quality.',
        icon: Mail,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
    },
    {
        title: 'Multi-Currency',
        description: 'Full support for INR and USD with real-time exchange rates.',
        icon: Globe,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
];

const Features = () => {
    return (
        <section id="features" className="py-32 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                        Elite Tools for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 underline decoration-indigo-500/30 underline-offset-8">Elite Freelancers</span>
                    </h2>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Everything you need to automate your financial workflow and focus on what you love.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />
                            
                            <div className={`w-16 h-16 rounded-2xl ${feature.bg.replace('bg-', 'bg-')}/20 flex items-center justify-center mb-8 border border-white/5 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                <feature.icon className={feature.color} size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight relative z-10">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-medium relative z-10 group-hover:text-slate-300 transition-colors">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
