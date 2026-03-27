import React from 'react';
import { Zap, Shield, Users, BarChart3, Mail, Globe } from 'lucide-react';

const features = [
    {
        title: 'Auto Reminders',
        description: 'Smart follow-ups that get you paid without the awkward conversations.',
        icon: Zap,
        color: 'bg-amber-50 text-amber-600',
    },
    {
        title: 'Payment Tracking',
        description: 'Real-time visibility into every invoice status from draft to deposited.',
        icon: BarChart3,
        color: 'bg-blue-50 text-blue-600',
    },
    {
        title: 'Client Management',
        description: 'Keep your client details, history, and notes organized in one clean place.',
        icon: Users,
        color: 'bg-indigo-50 text-indigo-600',
    },
    {
        title: 'Revenue Reports',
        description: 'Beautiful charts that help you understand your growth and collections.',
        icon: Shield,
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        title: 'Professional Invoices',
        description: 'Send beautiful PDF invoices that reflect your brand professional quality.',
        icon: Mail,
        color: 'bg-rose-50 text-rose-600',
    },
    {
        title: 'Multi-Currency',
        description: 'Full support for INR and USD with real-time exchange rates.',
        icon: Globe,
        color: 'bg-violet-50 text-violet-600',
    },
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Everything You Need to Get Paid Faster
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Focus on your work. Let PayTrack handle the follow-ups and tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
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
